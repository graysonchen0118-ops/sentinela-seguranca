"use client";

import Link from "next/link";
import {
  Bug,
  Radar,
  Target,
  ArrowRight,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ServerCrash,
} from "lucide-react";
import Shell from "@/components/Shell";
import { Hero } from "@/components/Scenes";
import {
  SeverityPill,
  StatusPill,
  Skeleton,
  TiltCard,
  fmtDate,
} from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  SEVERITIES,
  SEVERITY_LABEL,
  SEVERITY_WEIGHT,
  type Severity,
  type Category,
} from "@/lib/types";

const SEV_COLOR: Record<Severity, string> = {
  critica: "var(--sev-critica)",
  alta: "var(--sev-alta)",
  media: "var(--sev-media)",
  baixa: "var(--sev-baixa)",
  info: "var(--sev-info)",
};

export default function OverviewPage() {
  const { loading, findings, assets, bounties } = useStore();

  const open = findings.filter((f) => f.status !== "reteste_ok");
  const crit = findings.filter(
    (f) => f.severity === "critica" && f.status !== "reteste_ok"
  );
  const orphans = assets.filter((a) => a.orphan);
  const triagem = bounties.filter((b) => b.status === "triagem");
  const retested = findings.filter((f) => f.status === "reteste_ok").length;
  const fixedRate = Math.round((retested / Math.max(findings.length, 1)) * 100);

  const bySeverity = SEVERITIES.map((s) => ({
    s,
    n: findings.filter((f) => f.severity === s).length,
  }));
  const maxSev = Math.max(...bySeverity.map((x) => x.n), 1);

  const cats: Category[] = [
    "Controle de Acesso",
    "Autenticação",
    "Exposição de Dados",
    "Configuração",
    "Injeção",
    "Lógica de Negócio",
    "Criptografia",
  ];
  const byCat = cats
    .map((c) => ({
      c,
      n: findings.filter((f) => f.category === c).length,
      risk: findings
        .filter((f) => f.category === c)
        .reduce((a, f) => a + SEVERITY_WEIGHT[f.severity], 0),
    }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.risk - a.risk);
  const maxRisk = Math.max(...byCat.map((x) => x.risk), 1);

  const recent = [...findings]
    .sort(
      (a, b) =>
        SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
        b.discovered.localeCompare(a.discovered)
    )
    .slice(0, 6);

  const topExposed = [...assets]
    .sort(
      (a, b) =>
        (b.exposure === "crítico" ? 3 : b.exposure === "alto" ? 2 : 1) -
          (a.exposure === "crítico" ? 3 : a.exposure === "alto" ? 2 : 1) ||
        Number(b.orphan) - Number(a.orphan)
    )
    .slice(0, 5);

  return (
    <Shell
      title="Visão geral"
      subtitle="O estado da segurança da plataforma, ordenado pelo risco real"
    >
      <section className="hero rise">
        <Hero />
        <div className="hero-inner">
          <span className="hero-tag">
            <Radar size={13} /> Auditoria em andamento
          </span>
          <h2>Onde o dado do usuário pode vazar, antes que alguém de fora ache</h2>
          <p>
            Cada rota testada, cada ativo exposto no mapa, cada correção conferida. O
            que decide não é o ataque genial, é o acesso que ninguém olhou.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/achados">
              Ver achados <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost" href="/superficie">
              Superfície de ataque
            </Link>
          </div>
        </div>
      </section>

      <div className="grid kpi-grid">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div className="card" key={i}>
              <Skeleton h={38} w={38} r={11} />
              <div style={{ height: 14 }} />
              <Skeleton h={30} w={90} />
              <div style={{ height: 8 }} />
              <Skeleton h={12} w={120} />
            </div>
          ))
        ) : (
          <>
            <Kpi
              icon={<Bug size={19} />}
              val={open.length}
              label="Achados em aberto"
              foot={`${findings.length} no total da auditoria`}
            />
            <Kpi
              icon={<ShieldAlert size={19} />}
              val={crit.length}
              label="Críticos sem reteste"
              foot="A fila que decide o projeto"
              danger
            />
            <Kpi
              icon={<ServerCrash size={19} />}
              val={orphans.length}
              label="Ativos órfãos no ar"
              foot={`de ${assets.length} ativos mapeados`}
            />
            <Kpi
              icon={<Target size={19} />}
              val={triagem.length}
              label="Submissões em triagem"
              foot="Programa de recompensa"
            />
          </>
        )}
      </div>

      <div className="insight rise rise-2">
        <span className="insight-mark">
          <KeyRound size={20} />
        </span>
        <div>
          <h4>O ponto que decide: controle de acesso</h4>
          <p>
            A maioria dos críticos não é exploit exótico, é um usuário autenticado
            alcançando o dado de outro trocando um ID. O achado SEN-001 mostra isso no
            endpoint de pedidos, e é por onde a base inteira vaza sem deixar rastro.{" "}
            <Link
              href="/achados?cat=Controle+de+Acesso"
              style={{ color: "var(--accent)", fontWeight: 700 }}
            >
              Ver os achados de acesso
            </Link>
          </p>
        </div>
      </div>

      <div className="grid col-grid">
        <TiltCard className="card-pad-lg rise rise-2">
          <div className="section-head">
            <div>
              <h3>Achados por severidade</h3>
              <p>Onde o risco está concentrado</p>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "9px 0" }}>
                    <Skeleton h={12} />
                  </div>
                ))
              : bySeverity.map((row) => (
                  <div className="bar-row" key={row.s}>
                    <span className="bar-label" style={{ color: SEV_COLOR[row.s] }}>
                      {SEVERITY_LABEL[row.s]}
                    </span>
                    <span className="bar-track">
                      <span
                        className="bar-fill"
                        style={{
                          width: `${(row.n / maxSev) * 100}%`,
                          background: SEV_COLOR[row.s],
                        }}
                      />
                    </span>
                    <span className="bar-val">{row.n}</span>
                  </div>
                ))}
          </div>
        </TiltCard>

        <TiltCard className="card-pad-lg rise rise-3">
          <div className="section-head">
            <div>
              <h3>Progresso de correção</h3>
              <p>Nada fecha sem reteste</p>
            </div>
          </div>
          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
                  Retestado e confirmado
                </span>
                <span style={{ fontWeight: 800 }}>{fixedRate}%</span>
              </div>
              <div className="meter">
                <span style={{ width: `${fixedRate}%` }} />
              </div>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Mini n={open.length} label="Em aberto" color="var(--sev-critica)" />
              <Mini
                n={findings.filter((f) => f.status === "corrigido").length}
                label="Aguardam reteste"
                color="var(--accent-2)"
              />
              <Mini n={retested} label="Reteste OK" color="var(--ok)" />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0, lineHeight: 1.55 }}>
              Corrigido entra em reteste, não em concluído. Patch que trata só o sintoma
              reabre a brecha num endpoint novo.
            </p>
          </div>
        </TiltCard>
      </div>

      <div className="grid col-grid">
        <TiltCard className="card-pad-lg rise rise-3" style={{ gridColumn: "span 1" }}>
          <div className="section-head">
            <div>
              <h3>Achados recentes</h3>
              <p>Os de maior risco primeiro</p>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/achados">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column" }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 0" }}>
                    <Skeleton h={14} />
                  </div>
                ))
              : recent.map((f) => (
                  <Link
                    key={f.id}
                    href={`/achados?f=${f.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "11px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span className="cell-id" style={{ width: 62, flex: "none" }}>
                      {f.id}
                    </span>
                    <span style={{ flex: 1, fontWeight: 600, minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {f.title}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>
                        {f.category}
                      </span>
                    </span>
                    <SeverityPill s={f.severity} />
                  </Link>
                ))}
          </div>
        </TiltCard>

        <TiltCard className="card-pad-lg rise rise-4">
          <div className="section-head">
            <div>
              <h3>Ativos mais expostos</h3>
              <p>O que o mundo de fora alcança</p>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/superficie">
              Mapa <ArrowRight size={14} />
            </Link>
          </div>
          <div style={{ marginTop: 6 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 0" }}>
                    <Skeleton h={14} />
                  </div>
                ))
              : topExposed.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "11px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: "grid",
                        placeItems: "center",
                        flex: "none",
                        background: a.orphan
                          ? "rgba(244,63,94,0.14)"
                          : "rgba(148,170,214,0.08)",
                        color: a.orphan ? "var(--sev-critica)" : "var(--muted)",
                      }}
                    >
                      {a.orphan ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        className="cell-area"
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "var(--text)",
                        }}
                      >
                        {a.host}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
                        {a.orphan ? "Órfão, visto " + fmtDate(a.lastSeen) : a.kind}
                      </span>
                    </span>
                    <span className={`pill sev-${a.exposure === "crítico" ? "critica" : a.exposure === "alto" ? "alta" : "baixa"}`}>
                      {a.exposure}
                    </span>
                  </div>
                ))}
          </div>
        </TiltCard>
      </div>
    </Shell>
  );
}

function Kpi({
  icon,
  val,
  label,
  foot,
  danger,
}: {
  icon: React.ReactNode;
  val: number;
  label: string;
  foot: string;
  danger?: boolean;
}) {
  return (
    <TiltCard className="kpi rise">
      <div className="kpi-top">
        <span
          className="kpi-icon"
          style={
            danger
              ? { background: "rgba(244,63,94,0.14)", color: "var(--sev-critica)" }
              : undefined
          }
        >
          {icon}
        </span>
      </div>
      <div className="kpi-val" style={danger ? { color: "var(--sev-critica)" } : undefined}>
        {val}
      </div>
      <div className="kpi-label">{label}</div>
      <div style={{ fontSize: 12, color: "var(--faint)" }}>{foot}</div>
    </TiltCard>
  );
}

function Mini({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div
      style={{
        borderRadius: 11,
        border: "1px solid var(--border)",
        padding: "12px 10px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{n}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
