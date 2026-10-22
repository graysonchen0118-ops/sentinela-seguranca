"use client";

import { useMemo, useState } from "react";
import {
  EyeOff,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
} from "lucide-react";
import Shell from "@/components/Shell";
import { Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { SecrecyStatus } from "@/lib/types";

const STATUS_META: Record<
  SecrecyStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  protegido: {
    label: "Protegido",
    color: "var(--ok)",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.3)",
  },
  corrigido: {
    label: "Corrigido",
    color: "var(--accent-2)",
    bg: "rgba(34,211,238,0.1)",
    border: "rgba(34,211,238,0.3)",
  },
  risco: {
    label: "Em risco",
    color: "var(--sev-critica)",
    bg: "rgba(244,63,94,0.1)",
    border: "rgba(244,63,94,0.3)",
  },
};

export default function CartasPage() {
  const { loading, secrecy, busy, resolveSecrecy } = useStore();
  const [filter, setFilter] = useState<"todos" | "risco" | "ok">("todos");

  const risco = secrecy.filter((s) => s.status === "risco").length;
  const seguros = secrecy.filter((s) => s.status !== "risco").length;

  const list = useMemo(() => {
    let l = secrecy;
    if (filter === "risco") l = l.filter((s) => s.status === "risco");
    if (filter === "ok") l = l.filter((s) => s.status !== "risco");
    const rank: Record<SecrecyStatus, number> = { risco: 3, corrigido: 2, protegido: 1 };
    return [...l].sort((a, b) => rank[b.status] - rank[a.status]);
  }, [secrecy, filter]);

  return (
    <Shell
      title="Sigilo das cartas"
      subtitle="A carta privada não sai do servidor até o showdown"
    >
      <div className="grid kpi-grid">
        <Stat icon={<AlertTriangle size={18} />} n={risco} label="Canais em risco" danger={risco > 0} />
        <Stat icon={<ShieldCheck size={18} />} n={seguros} label="Canais fechados" />
        <Stat icon={<EyeOff size={18} />} n={secrecy.length} label="Caminhos conferidos" />
      </div>

      <div className="insight">
        <span className="insight-mark">
          <EyeOff size={20} />
        </span>
        <div>
          <h4>A carta do adversário não pode nem chegar no aparelho</h4>
          <p>
            Esconder na tela não basta, porque o dado já viajou. Cada caminho por onde uma carta
            privada poderia passar é conferido aqui, da conexão ao vivo ao histórico da mão, e
            fechado um a um. O que está em vermelho ainda deixa a carta sair antes da hora.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <button className={`filter-chip ${filter === "todos" ? "on" : ""}`} onClick={() => setFilter("todos")}>
          Todos ({secrecy.length})
        </button>
        <button className={`filter-chip ${filter === "risco" ? "on" : ""}`} onClick={() => setFilter("risco")}>
          Em risco ({risco})
        </button>
        <button className={`filter-chip ${filter === "ok" ? "on" : ""}`} onClick={() => setFilter("ok")}>
          Fechados ({seguros})
        </button>
      </div>

      {loading ? (
        <div className="grid col-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="card" key={i}>
              <Skeleton h={18} w="55%" />
              <div style={{ height: 12 }} />
              <Skeleton h={12} />
              <div style={{ height: 6 }} />
              <Skeleton h={12} w="80%" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid col-grid">
          {list.map((c) => {
            const m = STATUS_META[c.status];
            return (
              <div
                key={c.id}
                className="card tilt rise"
                style={c.status === "risco" ? { borderColor: "rgba(244,63,94,0.3)" } : undefined}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      flex: "none",
                      background: m.bg,
                      color: m.color,
                    }}
                  >
                    {c.status === "risco" ? <EyeOff size={17} /> : <Lock size={17} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{c.surface}</div>
                    <div className="cell-area">{c.path}</div>
                  </div>
                  <span
                    className="pill"
                    style={{ color: m.color, background: m.bg, borderColor: m.border }}
                  >
                    <span className="dot" />
                    {m.label}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "var(--muted)", margin: "13px 0 0", lineHeight: 1.5 }}>
                  {c.detail}
                </p>

                <div
                  style={{
                    marginTop: 12,
                    paddingTop: 12,
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <ArrowRight size={14} color="var(--ok)" style={{ flex: "none" }} />
                  <span style={{ fontSize: 12.5, color: "var(--text)", flex: 1 }}>{c.control}</span>
                  {c.status === "risco" && (
                    <button
                      className="btn btn-primary btn-sm"
                      disabled={busy}
                      onClick={() => resolveSecrecy(c.id)}
                    >
                      Fechar canal
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Shell>
  );
}

function Stat({
  icon,
  n,
  label,
  danger,
}: {
  icon: React.ReactNode;
  n: number;
  label: string;
  danger?: boolean;
}) {
  return (
    <div className="card tilt kpi rise">
      <div className="kpi-top">
        <span
          className="kpi-icon"
          style={danger ? { background: "rgba(244,63,94,0.14)", color: "var(--sev-critica)" } : undefined}
        >
          {icon}
        </span>
      </div>
      <div className="kpi-val" style={danger ? { color: "var(--sev-critica)" } : undefined}>
        {n}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
