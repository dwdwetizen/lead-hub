import { useSyncExternalStore } from "react";
import type { EtapaCRM, Lead, Perfil, Reuniao } from "@/types/lead";
import { catalogoOnline, colaboradores, leadsIniciais, usuarioAtual } from "@/mocks/leads";
import { addDays, atHour } from "@/lib/date-utils";

/**
 * Camada de serviço simulada.
 * Todas as funções são assíncronas e possuem assinaturas estáveis para que
 * possam ser trocadas por chamadas reais (Supabase / Google Places / Google
 * Agenda / Grok) sem alterar os componentes.
 */

interface State {
  leads: Lead[];
  perfil: Perfil;
  colaboradores: typeof colaboradores;
}

let state: State = {
  leads: leadsIniciais,
  perfil: "gestao",
  colaboradores,
};

const listeners = new Set<() => void>();

function setState(updater: (s: State) => State) {
  state = updater(state);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function useLocalWayState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useLeads() {
  return useLocalWayState().leads;
}

export function usePerfil() {
  return useLocalWayState().perfil;
}

export function setPerfil(perfil: Perfil) {
  setState((s) => ({ ...s, perfil }));
}

export const usuario = usuarioAtual;

const delay = (ms = 220) => new Promise((r) => setTimeout(r, ms));

let seq = 1000;
const novoId = () => `l${++seq}`;

function registrar(
  lead: Lead,
  tipo: string,
  titulo: string,
  detalhe?: string,
  autor = usuarioAtual.nome,
): Lead {
  return {
    ...lead,
    historico: [
      { id: `h${++seq}`, data: new Date().toISOString(), tipo, titulo, detalhe, autor },
      ...lead.historico,
    ],
  };
}

function update(id: string, fn: (lead: Lead) => Lead) {
  setState((s) => ({ ...s, leads: s.leads.map((l) => (l.id === id ? fn(l) : l)) }));
  return state.leads.find((l) => l.id === id)!;
}

export interface NovoLeadInput {
  empresa: string;
  segmento: string;
  cidade: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  contato: string;
  decisor: string;
  email: string;
  observacoes: string;
}

export async function criarLead(input: NovoLeadInput, origem: "presencial" | "online" = "presencial") {
  await delay();
  const lead: Lead = {
    id: novoId(),
    ...input,
    origem,
    modulo: "prospeccao",
    resultado: "novo",
    tentativas: 0,
    responsavel: usuarioAtual.nome,
    valorEstimado: 0,
    ultimaAnotacao: input.observacoes || undefined,
    historico: [
      {
        id: `h${++seq}`,
        data: new Date().toISOString(),
        tipo: "cadastro",
        titulo: "Lead cadastrado",
        autor: usuarioAtual.nome,
      },
    ],
  };
  setState((s) => ({ ...s, leads: [lead, ...s.leads] }));
  return lead;
}

/** Registra tentativa sem contato e reagenda automaticamente para amanhã. */
export async function registrarNaoAtendeu(id: string) {
  await delay(120);
  const amanha = atHour(addDays(new Date(), 1), 9).toISOString();
  return update(id, (lead) =>
    registrar(
      {
        ...lead,
        resultado: "nao_atendeu",
        tentativas: lead.tentativas + 1,
        ultimoContato: new Date().toISOString(),
        proximaAcao: amanha,
        proximaAcaoLabel: "Nova tentativa de contato",
        ultimaAnotacao: "Não atendeu — nova tentativa agendada para amanhã.",
      },
      "tentativa",
      `Não atendeu (tentativa ${lead.tentativas + 1})`,
      "Nova tentativa agendada automaticamente para amanhã.",
    ),
  );
}

/** Agenda retorno e envia o lead para o Follow-up. */
export async function agendarRetorno(id: string, dataISO: string, observacao?: string) {
  await delay(120);
  return update(id, (lead) =>
    registrar(
      {
        ...lead,
        modulo: "followup",
        resultado: "retornar",
        ultimoContato: new Date().toISOString(),
        proximaAcao: dataISO,
        proximaAcaoLabel: "Retorno agendado",
        ultimaAnotacao: observacao || lead.ultimaAnotacao,
      },
      "retorno",
      "Retorno agendado",
      observacao,
    ),
  );
}

export async function registrarSemInteresse(id: string, observacao?: string) {
  await delay(120);
  return update(id, (lead) =>
    registrar(
      {
        ...lead,
        resultado: "sem_interesse",
        ultimoContato: new Date().toISOString(),
        proximaAcao: undefined,
        proximaAcaoLabel: undefined,
        ultimaAnotacao: observacao || "Sem interesse no momento.",
      },
      "resultado",
      "Marcado como sem interesse",
      observacao,
    ),
  );
}

export async function arquivarLead(id: string, motivo?: string) {
  await delay(120);
  return update(id, (lead) =>
    registrar(
      {
        ...lead,
        moduloAnterior: lead.modulo === "arquivado" ? lead.moduloAnterior : lead.modulo,
        modulo: "arquivado",
        proximaAcao: undefined,
        proximaAcaoLabel: undefined,
      },
      "arquivo",
      "Lead arquivado",
      motivo,
    ),
  );
}

export async function restaurarLead(id: string) {
  await delay(120);
  return update(id, (lead) =>
    registrar(
      { ...lead, modulo: lead.moduloAnterior ?? "prospeccao", moduloAnterior: undefined },
      "arquivo",
      "Lead restaurado",
    ),
  );
}

export async function enviarParaFollowUp(id: string, dataISO: string, observacao?: string) {
  return agendarRetorno(id, dataISO, observacao);
}

export async function registrarContato(id: string, anotacao: string) {
  await delay(120);
  return update(id, (lead) =>
    registrar(
      { ...lead, ultimoContato: new Date().toISOString(), ultimaAnotacao: anotacao },
      "ligacao",
      "Contato registrado",
      anotacao,
    ),
  );
}

/** Marca reunião, simula envio ao Google Agenda e move o lead para o CRM. */
export async function marcarReuniao(id: string, reuniao: Reuniao) {
  await delay(200);
  const quando = new Date(`${reuniao.data}T${reuniao.horario || "09:00"}:00`).toISOString();
  return update(id, (lead) =>
    registrar(
      {
        ...lead,
        modulo: "crm",
        resultado: "reuniao_marcada",
        etapa: "reuniao_marcada",
        etapaDesde: new Date().toISOString(),
        reuniao,
        proximaAcao: quando,
        proximaAcaoLabel: "Reunião agendada",
        ultimaAnotacao: reuniao.observacoes || "Reunião marcada.",
      },
      "reuniao",
      "Reunião marcada",
      `${reuniao.data} às ${reuniao.horario} • ${reuniao.local}`,
    ),
  );
}

export async function moverEtapa(id: string, etapa: EtapaCRM) {
  await delay(80);
  return update(id, (lead) =>
    registrar(
      { ...lead, etapa, etapaDesde: new Date().toISOString(), modulo: "crm" },
      "etapa",
      `Movido para ${etapaLabel(etapa)}`,
    ),
  );
}

export async function registrarPagamento(id: string) {
  await delay(150);
  const lead = state.leads.find((l) => l.id === id);
  setState((s) => ({
    ...s,
    colaboradores: s.colaboradores.map((c) =>
      c.nome === lead?.responsavel ? { ...c, vendasConvertidas: c.vendasConvertidas + 1 } : c,
    ),
  }));
  return update(id, (l) =>
    registrar(
      { ...l, etapa: "pago", resultado: "pago", etapaDesde: new Date().toISOString() },
      "pagamento",
      "Venda paga confirmada",
      `Valor: ${l.valorEstimado}`,
    ),
  );
}

export async function atualizarValor(id: string, valor: number) {
  await delay(80);
  return update(id, (lead) => ({ ...lead, valorEstimado: valor }));
}

/** Simula a busca de empresas (futuramente Google Places API). */
export async function gerarLeadsOnline(params: {
  segmento: string;
  local: string;
  quantidade: number;
}) {
  await delay(700);
  const novos: Lead[] = catalogoOnline.slice(0, params.quantidade).map((empresa, i) => ({
    id: novoId(),
    empresa: empresa.empresa,
    segmento: params.segmento,
    cidade: params.local,
    endereco: empresa.endereco,
    telefone: `(19) 3${(100 + i).toString()}-${(2000 + i * 7).toString().slice(0, 4)}`,
    whatsapp: `(19) 9${(9000 + i).toString()}-${(1100 + i * 3).toString()}`,
    contato: "Atendimento",
    decisor: "A identificar",
    email: "",
    observacoes: `Avaliação Google: ${empresa.avaliacao} ★`,
    origem: "online" as const,
    modulo: "prospeccao" as const,
    resultado: "novo" as const,
    tentativas: 0,
    responsavel: usuarioAtual.nome,
    valorEstimado: 0,
    historico: [
      {
        id: `h${++seq}`,
        data: new Date().toISOString(),
        tipo: "geracao",
        titulo: "Lead gerado na prospecção online",
        detalhe: `${params.segmento} • ${params.local}`,
        autor: usuarioAtual.nome,
      },
    ],
  }));
  setState((s) => ({ ...s, leads: [...novos, ...s.leads] }));
  return novos;
}

export function etapaLabel(etapa: EtapaCRM) {
  return {
    reuniao_marcada: "Reunião marcada",
    reuniao_realizada: "Reunião realizada",
    proposta_enviada: "Proposta enviada",
    em_negociacao: "Em negociação",
    pago: "Pago",
    perdido: "Perdido",
  }[etapa];
}

export const ETAPAS: EtapaCRM[] = [
  "reuniao_marcada",
  "reuniao_realizada",
  "proposta_enviada",
  "em_negociacao",
  "pago",
  "perdido",
];
