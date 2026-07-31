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

const STORAGE_KEY = "localway:lead-hub:v1";
const STORAGE_VERSION = 1;

const initialState: State = {
  leads: leadsIniciais,
  perfil: "gestao",
  colaboradores,
};

let state: State = initialState;
let hydrated = false;
let storageListenerActive = false;
const listeners = new Set<() => void>();

function isPerfil(value: unknown): value is Perfil {
  return value === "gestao" || value === "colaborador";
}

function parseStoredState(raw: string | null): State | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const record = parsed as Record<string, unknown>;
    const candidate =
      record.version === STORAGE_VERSION && record.state && typeof record.state === "object"
        ? (record.state as Record<string, unknown>)
        : record;

    if (!Array.isArray(candidate.leads) || !isPerfil(candidate.perfil)) return null;

    const leads = candidate.leads.filter((lead): lead is Lead =>
      Boolean(
        lead &&
        typeof lead === "object" &&
        typeof (lead as Lead).id === "string" &&
        typeof (lead as Lead).empresa === "string" &&
        Array.isArray((lead as Lead).historico),
      ),
    );

    const persistedColaboradores = Array.isArray(candidate.colaboradores)
      ? candidate.colaboradores.filter(
          (colaborador): colaborador is (typeof colaboradores)[number] =>
            Boolean(
              colaborador &&
              typeof colaborador === "object" &&
              typeof (colaborador as (typeof colaboradores)[number]).id === "string" &&
              typeof (colaborador as (typeof colaboradores)[number]).nome === "string" &&
              typeof (colaborador as (typeof colaboradores)[number]).iniciais === "string" &&
              typeof (colaborador as (typeof colaboradores)[number]).vendasConvertidas === "number",
            ),
        )
      : [];

    return {
      leads,
      perfil: candidate.perfil,
      colaboradores: persistedColaboradores.length ? persistedColaboradores : colaboradores,
    };
  } catch {
    return null;
  }
}

function persistState(nextState: State) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, state: nextState }),
    );
  } catch {
    // O app continua funcional mesmo se o navegador bloquear ou lotar o localStorage.
  }
}

function hydrateFromStorage() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    state = parseStoredState(window.localStorage.getItem(STORAGE_KEY)) ?? initialState;
  } catch {
    state = initialState;
  }
  syncSequence(state);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setState(updater: (s: State) => State) {
  hydrateFromStorage();
  state = updater(state);
  persistState(state);
  notifyListeners();
}

function subscribe(listener: () => void) {
  hydrateFromStorage();
  listeners.add(listener);

  if (typeof window !== "undefined" && !storageListenerActive) {
    window.addEventListener("storage", handleStorageChange);
    storageListenerActive = true;
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined" && storageListenerActive && listeners.size === 0) {
      window.removeEventListener("storage", handleStorageChange);
      storageListenerActive = false;
    }
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => initialState;

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;

  const nextState = parseStoredState(event.newValue) ?? initialState;
  if (event.newValue === null || nextState !== state) {
    state = nextState;
    syncSequence(state);
    notifyListeners();
  }
}

export function useLocalWayState() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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
function syncSequence(currentState: State) {
  for (const lead of currentState.leads) {
    const leadSequence = Number.parseInt(lead.id.replace(/\D/g, ""), 10);
    if (Number.isFinite(leadSequence)) seq = Math.max(seq, leadSequence);
    for (const item of lead.historico) {
      const historySequence = Number.parseInt(item.id.replace(/\D/g, ""), 10);
      if (Number.isFinite(historySequence)) seq = Math.max(seq, historySequence);
    }
  }
}
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

export async function criarLead(
  input: NovoLeadInput,
  origem: "presencial" | "online" = "presencial",
) {
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

/** Atualiza os campos editáveis do lead sem permitir a troca do id ou do histórico. */
export async function atualizarLead(id: string, updates: Partial<Lead>) {
  await delay(80);
  return update(id, (lead) => {
    const { id: _id, historico: _historico, ...campos } = updates;
    return registrar(
      { ...lead, ...campos, id: lead.id, historico: lead.historico },
      "edicao",
      "Informações atualizadas",
    );
  });
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

