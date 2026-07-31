export type Origem = "presencial" | "online";

export type Resultado =
  | "novo"
  | "nao_atendeu"
  | "retornar"
  | "sem_interesse"
  | "reuniao_marcada"
  | "em_negociacao"
  | "pago"
  | "perdido";

export type Modulo = "prospeccao" | "followup" | "crm" | "arquivado";

export type EtapaCRM =
  | "reuniao_marcada"
  | "reuniao_realizada"
  | "proposta_enviada"
  | "em_negociacao"
  | "pago"
  | "perdido";

export interface HistoricoItem {
  id: string;
  data: string; // ISO
  tipo: string;
  titulo: string;
  detalhe?: string;
  autor: string;
}

export interface ResumoIA {
  transcricao: string;
  resumo: string;
  dores: string[];
  objecoes: string[];
  proximosPassos: string[];
  roteiro: string[];
  duracaoAudio: string;
}

export interface Reuniao {
  data: string; // ISO date
  horario: string;
  duracao: string;
  pessoa: string;
  telefone: string;
  whatsapp: string;
  email: string;
  local: string;
  observacoes?: string;
}

export interface Lead {
  id: string;
  empresa: string;
  segmento: string;
  cidade: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  contato: string;
  decisor: string;
  email: string;
  site?: string;
  instagram?: string;
  googleMapsUrl?: string;
  avaliacaoGoogle?: number;
  totalAvaliacoes?: number;
  totalFotos?: number;
  posicionamentoGoogle?: number;
  observacoes: string;
  origem: Origem;
  modulo: Modulo;
  moduloAnterior?: Modulo;
  resultado: Resultado;
  tentativas: number;
  ultimoContato?: string; // ISO
  proximaAcao?: string; // ISO com horário
  proximaAcaoLabel?: string;
  responsavel: string;
  valorEstimado: number;
  etapa?: EtapaCRM;
  etapaDesde?: string;
  reuniao?: Reuniao;
  resumoIA?: ResumoIA;
  ultimaAnotacao?: string;
  historico: HistoricoItem[];
}

export interface Colaborador {
  id: string;
  nome: string;
  iniciais: string;
  vendasConvertidas: number;
}

export type Perfil = "gestao" | "colaborador";

