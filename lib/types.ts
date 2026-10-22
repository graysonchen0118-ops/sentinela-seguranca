export type Severity = "critica" | "alta" | "media" | "baixa" | "info";

export type FindingStatus = "aberto" | "em_correcao" | "corrigido" | "reteste_ok";

export type Category =
  | "Sigilo de Cartas"
  | "Aleatoriedade (RNG)"
  | "Controle de Acesso"
  | "Caixa e Saques"
  | "Colusão e Bots"
  | "Integridade da Partida"
  | "Configuração";

export interface Finding {
  id: string;
  title: string;
  category: Category;
  severity: Severity;
  status: FindingStatus;
  area: string;
  description: string;
  risk: string;
  fix: string;
  reproducao: string;
  discovered: string;
  owner: string;
}

// Onde uma carta privada poderia vazar, e se o canal está protegido.
export type SecrecyStatus = "protegido" | "risco" | "corrigido";
export interface SecrecyCheck {
  id: string;
  surface: string;
  path: string;
  status: SecrecyStatus;
  detail: string;
  control: string;
}

// Mão provably-fair: o servidor compromete o baralho antes (hash), revela depois.
export type HandStatus = "em_jogo" | "encerrada";
export interface Hand {
  id: string;
  mesa: string;
  jogadores: number;
  quando: string;
  serverSeedHash: string;
  clientSeed: string;
  serverSeedRevealed: string | null;
  status: HandStatus;
  verificado: boolean;
}

// Conta sinalizada por suspeita de colusão, multiconta ou bot.
export type FlagStatus = "em_analise" | "restrito" | "limpo";
export interface FlaggedPlayer {
  id: string;
  handle: string;
  motivo: string;
  risco: Severity;
  mesas: number;
  sinal: string;
  status: FlagStatus;
}

export const SEVERITIES: Severity[] = ["critica", "alta", "media", "baixa", "info"];

export const SEVERITY_LABEL: Record<Severity, string> = {
  critica: "Crítica",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
  info: "Informativa",
};

export const STATUS_LABEL: Record<FindingStatus, string> = {
  aberto: "Aberto",
  em_correcao: "Em correção",
  corrigido: "Corrigido",
  reteste_ok: "Reteste OK",
};

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critica: 5,
  alta: 4,
  media: 3,
  baixa: 2,
  info: 1,
};

export const FLAG_STATUS_LABEL: Record<FlagStatus, string> = {
  em_analise: "Em análise",
  restrito: "Restrito",
  limpo: "Liberado",
};
