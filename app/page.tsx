"use client";

import Link from "next/link";
import {
  Bug,
  EyeOff,
  Shuffle,
  ArrowRight,
  ShieldAlert,
  Spade,
  Users,
  CheckCircle2,
} from "lucide-react";
import Shell from "@/components/Shell";
import { Hero } from "@/components/Scenes";
import { SeverityPill, Skeleton, TiltCard } from "@/components/ui";
import { avatarUrl } from "@/lib/avatars";
import { useStore } from "@/lib/store";
import {
  SEVERITIES,
  SEVERITY_LABEL,
  SEVERITY_WEIGHT,
  type Severity,
} from "@/lib/types";

const SEV_COLOR: Record<Severity, string> = {
  critica: "var(--sev-critica)",
  alta: "var(--sev-alta)",
  media: "var(--sev-media)",
  baixa: "var(--sev-baixa)",
  info: "var(--sev-info)",
};

export default function OverviewPage() {
  const { loading, findings, secrecy, hands, players } = useStore();

  const open = findings.filter((f) => f.status !== "reteste_ok");
  const crit = findings.filter((f) => f.severity === "critica" && f.status !== "reteste_ok");
  const secrecyRisk = secrecy.filter((s) => s.status === "risco").length;
  const handsVerif = hands.filter((h) => h.verificado).length;
  const flagged = players.filter((p) => p.status === "em_analise").length;

  const bySeverity = SEVERITIES.map((s) => ({
    s,
    n: findings.filter((f) => f.severity === s).length,
  }));
  const maxSev = Math.max(...bySeverity.map((x) => x.n), 1);

  const retested = findings.filter((f) => f.status === "reteste_ok").length;
  const fixedRate = Math.round((retested / Math.max(findings.length, 1)) * 100);

  const recent = [...findings]
    .sort(
      (a, b) =>
        SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
        b.discovered.localeCompare(a.discovered)
    )
    .slice(0, 6);

  const topFlagged = [...players]
    .sort((a, b) => SEVERITY_WEIGHT[b.risco] - SEVERITY_WEIGHT[a.risco])
    .slice(0, 5);

  return (
    <Shell
      title="Visão geral"
      subtitle="A integridade do jogo, da carta secreta ao baralho justo"
    >
      <section className="hero rise">
        <Hero />
        <div className="hero-inner">
          <span className="hero-tag">
            <Spade size={13} /> Mesa sob auditoria
          </span>
          <h2>Ninguém vê a carta do outro, ninguém adivinha a próxima</h2>
          <p>
            A carta privada não sai do servidor até o showdown, e o baralho é embaralhado de um
            jeito que não dá pra prever, e dá pra provar.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/cartas">
              Sigilo das cartas <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost" href="/baralho">
              Baralho justo
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
              icon={<ShieldAlert size={19} />}
              val={crit.length}
              label="Críticos sem reteste"
              foot="A fila que decide o jogo"
              danger
            />
            <Kpi
              icon={<EyeOff size={19} />}
              val={secrecyRisk}
              label="Canais de carta em risco"
              foot={`de ${secrecy.length} caminhos conferidos`}
              danger={secrecyRisk > 0}
            />
            <Kpi
              icon={<Shuffle size={19} />}
              val={handsVerif}
              label="Mãos verificadas"
              foot={`baralho justo provado`}
            />
            <Kpi
              icon={<Users size={19} />}
              val={flagged}
              label="Jogadores em análise"
              foot="Colusão, bot ou multiconta"
            />
          </>
        )}
      </div>

      <div className="insight rise rise-2">
        <span className="insight-mark">
          <EyeOff size={20} />
        </span>
        <div>
          <h4>O ponto que decide: a carta privada nunca sai do servidor</h4>
          <p>
            O erro clássico é o servidor mandar a mão de todos pro aplicativo e a tela só esconder
            a dos adversários. Um cliente modificado lê tudo por baixo. A correção é mandar a cada
            um só a própria mão, e o resto só no showdown.{" "}
            <Link href="/cartas" style={{ color: "var(--accent)", fontWeight: 700 }}>
              Ver os canais da carta
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
                        style={{ width: `${(row.n / maxSev) * 100}%`, background: SEV_COLOR[row.s] }}
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13.5, color: "var(--muted)" }}>Retestado e confirmado</span>
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
              Corrigido entra em reteste, não em concluído. Um conserto que trata só o sintoma
              reabre a brecha na mão seguinte.
            </p>
          </div>
        </TiltCard>
      </div>

      <div className="grid col-grid">
        <TiltCard className="card-pad-lg rise rise-3">
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
                      <span style={{ fontSize: 12, color: "var(--muted)" }}>{f.category}</span>
                    </span>
                    <SeverityPill s={f.severity} />
                  </Link>
                ))}
          </div>
        </TiltCard>

        <TiltCard className="card-pad-lg rise rise-4">
          <div className="section-head">
            <div>
              <h3>Jogadores sinalizados</h3>
              <p>Colusão, bots e multiconta</p>
            </div>
          </div>
          <div style={{ marginTop: 6 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 0" }}>
                    <Skeleton h={14} />
                  </div>
                ))
              : topFlagged.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "10px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <img
                      src={avatarUrl(p.handle)}
                      alt={p.handle}
                      width={36}
                      height={36}
                      loading="lazy"
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        flex: "none",
                        border: "1px solid var(--border)",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.handle}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                        {p.motivo} · {p.mesas} mesas
                      </div>
                    </div>
                    <SeverityPill s={p.risco} />
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
          style={danger ? { background: "rgba(244,63,94,0.14)", color: "var(--sev-critica)" } : undefined}
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
    <div style={{ borderRadius: 11, border: "1px solid var(--border)", padding: "12px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{n}</div>
      <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{label}</div>
    </div>
  );
}
