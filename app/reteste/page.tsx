"use client";

import { useMemo } from "react";
import {
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  Undo2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Shell from "@/components/Shell";
import { SeverityPill, Skeleton, fmtDate } from "@/components/ui";
import { useStore } from "@/lib/store";
import { SEVERITY_WEIGHT, type Finding } from "@/lib/types";

export default function RetestePage() {
  const { loading, findings, busy, setFindingStatus } = useStore();

  const waiting = useMemo(
    () =>
      findings
        .filter((f) => f.status === "corrigido")
        .sort((a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]),
    [findings]
  );
  const inFix = findings.filter((f) => f.status === "em_correcao");
  const done = useMemo(
    () => findings.filter((f) => f.status === "reteste_ok"),
    [findings]
  );

  const total = findings.length;
  const pct = Math.round((done.length / Math.max(total, 1)) * 100);

  return (
    <Shell
      title="Reteste"
      subtitle="Corrigido não é fechado, reteste confirma que a brecha fechou de verdade"
    >
      <div className="insight">
        <span className="insight-mark" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <RefreshCw size={20} />
        </span>
        <div>
          <h4>Por que o reteste decide o fim do trabalho</h4>
          <p>
            Um patch costuma travar só o payload exato, não a classe inteira, e a mesma
            falha volta num endpoint novo meses depois. Aqui cada correção é conferida, e
            a classe toda é testada, não só a falha reportada.
          </p>
        </div>
      </div>

      <div className="card card-pad-lg rise">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>Confirmado por reteste</span>
          <span style={{ color: "var(--muted)", fontSize: 13.5 }}>
            {done.length} de {total} achados, {inFix.length} ainda em correção
          </span>
        </div>
        <div className="meter">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
        <div style={{ minWidth: 0 }}>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <RotateCcw size={17} color="var(--accent-2)" />
              <h3>Aguardando reteste</h3>
            </div>
            <span className="st st-corrigido">{waiting.length}</span>
          </div>

          {loading ? (
            <div className="card">
              <Skeleton h={60} />
              <div style={{ height: 10 }} />
              <Skeleton h={60} />
            </div>
          ) : waiting.length === 0 ? (
            <div className="card">
              <div className="empty">
                <div className="empty-icon">
                  <Wrench size={22} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                  Nada na fila de reteste
                </div>
                <div style={{ fontSize: 13.5 }}>
                  Marque um achado como corrigido para ele chegar aqui.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {waiting.map((f) => (
                <RetestCard
                  key={f.id}
                  f={f}
                  busy={busy}
                  onPass={() => setFindingStatus(f.id, "reteste_ok")}
                  onFail={() => setFindingStatus(f.id, "aberto")}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <div className="section-head" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={17} color="var(--ok)" />
              <h3>Reteste aprovado</h3>
            </div>
            <span className="st st-reteste_ok">{done.length}</span>
          </div>

          {loading ? (
            <div className="card">
              <Skeleton h={48} />
              <div style={{ height: 10 }} />
              <Skeleton h={48} />
            </div>
          ) : done.length === 0 ? (
            <div className="card">
              <div className="empty">
                <div className="empty-icon">
                  <CheckCircle2 size={22} />
                </div>
                <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                  Ainda nada confirmado
                </div>
                <div style={{ fontSize: 13.5 }}>
                  Um reteste aprovado fecha o achado de verdade.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {done.map((f) => (
                <div
                  key={f.id}
                  className="card"
                  style={{ padding: 15, display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                      background: "rgba(52,211,153,0.14)",
                      color: "var(--ok)",
                    }}
                  >
                    <CheckCircle2 size={18} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.title}
                    </div>
                    <div className="cell-area">{f.area}</div>
                  </div>
                  <SeverityPill s={f.severity} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

function RetestCard({
  f,
  busy,
  onPass,
  onFail,
}: {
  f: Finding;
  busy: boolean;
  onPass: () => void;
  onFail: () => void;
}) {
  return (
    <div className="card tilt" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span className="cell-id">{f.id}</span>
        <SeverityPill s={f.severity} />
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtDate(f.discovered)}</span>
      </div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
      <div className="cell-area" style={{ marginBottom: 10 }}>
        {f.area}
      </div>
      <div className="callout fix" style={{ marginBottom: 12 }}>
        <span className="callout-label" style={{ color: "var(--ok)" }}>
          Correção aplicada
        </span>
        {f.fix}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={onPass}>
          <CheckCircle2 size={15} /> Reteste OK
        </button>
        <button className="btn btn-ghost btn-sm" disabled={busy} onClick={onFail}>
          <Undo2 size={15} /> Falhou, reabrir
        </button>
      </div>
    </div>
  );
}
