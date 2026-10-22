export type Severity = "critica" | "alta" | "media" | "baixa" | "info";

export type FindingStatus = "aberto" | "em_correcao" | "corrigido" | "reteste_ok";

export type Category =
  | "Controle de Acesso"
  | "Autenticação"
  | "Exposição de Dados"
  | "Injeção"
  | "Configuração"
  | "Criptografia"
  | "Lógica de Negócio";

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

export type AssetKind =
  | "domínio"
  | "subdomínio"
  | "api"
  | "servidor"
  | "armazenamento"
  | "painel";

export type Exposure = "crítico" | "alto" | "médio" | "baixo";

export interface Asset {
  id: string;
  host: string;
  kind: AssetKind;
  exposure: Exposure;
  orphan: boolean;
  lastSeen: string;
  note: string;
}

export type BountyStatus = "triagem" | "aceito" | "duplicado" | "inválido" | "pago";

export interface Bounty {
  id: string;
  title: string;
  severity: Severity;
  status: BountyStatus;
  researcher: string;
  payout: number;
  submitted: string;
  area: string;
  duplicateOf?: string;
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

export const BOUNTY_STATUS_LABEL: Record<BountyStatus, string> = {
  triagem: "Em triagem",
  aceito: "Aceito",
  duplicado: "Duplicado",
  inválido: "Inválido",
  pago: "Pago",
};

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critica: 5,
  alta: 4,
  media: 3,
  baixa: 2,
  info: 1,
};
