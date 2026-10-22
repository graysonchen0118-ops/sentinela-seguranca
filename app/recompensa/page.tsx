"use client";

import { useMemo, useState } from "react";
import {
  Target,
  CircleDollarSign,
  CopyCheck,
  Trophy,
  Check,
  Copy,
  Ban,
  BadgeDollarSign,
} from "lucide-react";
import Shell from "@/components/Shell";
import { BountyStatusPill, SeverityPill, Skeleton, fmtBRL, fmtDate } from "@/components/ui";
import { useStore } from "@/lib/store";
import { avatarUrl } from "@/lib/avatars";
import type { Bounty, BountyStatus } from "@/lib/types";

const FILTERS: { key: BountyStatus | "todos"; label: string }[] = [
  { key: "todos", label: "Todas" },
  { key: "triagem", label: "Em triagem" },
  { key: "aceito", label: "Aceitas" },
  { key: "pago", label: "Pagas" },
  { key: "duplicado", label: "Duplicadas" },
];

export default function RecompensaPage() {
  const { loading, bounties, busy, setBountyStatus } = useStore();
  const [filter, setFilter] = useState<BountyStatus | "todos">("todos");

  const list = useMemo(() => {
    const l = filter === "todos" ? bounties : bounties.filter((b) => b.status === filter);
    const rank: Record<BountyStatus, number> = {
      triagem: 5,
      aceito: 4,
      pago: 3,
      duplicado: 2,
      inválido: 1,
    };
    return [...l].sort(
      (a, b) => rank[b.status] - rank[a.status] || b.submitted.localeCompare(a.submitted)
    );
  }, [bounties, filter]);

  const triagem = bounties.filter((b) => b.status === "triagem").length;
  const pago = bounties.filter((b) => b.status === "pago").reduce((a, b) => a + b.payout, 0);
  const dup = bounties.filter((b) => b.status === "duplicado").length;

  const leaderboard = useMemo(() => {
    const totals = new Map<string, number>();
    bounties.forEach((b) => {
      if (b.status === "pago" || b.status === "aceito") {
        totals.set(b.researcher, (totals.get(b.researcher) ?? 0) + b.payout);
      }
    });
    return [...totals.entries()]
      .map(([researcher, total]) => ({ researcher, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [bounties]);

  return (
    <Shell
      title="Recompensa por bugs"
      subtitle="Triagem das submissões, com o que já foi achado na auditoria separado"
    >
      <div className="grid kpi-grid">
        <Stat icon={<Target size={18} />} val={String(triagem)} label="Em triagem" />
        <Stat
          icon={<CircleDollarSign size={18} />}
          val={fmtBRL(pago)}
          label="Total pago"
          accent
        />
        <Stat icon={<CopyCheck size={18} />} val={String(dup)} label="Duplicadas da auditoria" />
      </div>

      <div className="insight">
        <span className="insight-mark" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <CopyCheck size={20} />
        </span>
        <div>
          <h4>Duplicada da auditoria não paga recompensa</h4>
          <p>
            Submissões que batem com um achado já registrado entram como duplicadas e
            poupam o prêmio. É por isso que a auditoria vem antes: ela tira o sistemático
            da mesa, e o bounty sobra pro que é raro de achar.
          </p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0, 2.1fr) minmax(260px, 1fr)", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div className="toolbar">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-chip ${filter === f.key ? "on" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="card">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border)" }}
                >
                  <Skeleton h={32} w={32} r={16} />
                  <Skeleton h={14} w="50%" />
                  <div style={{ flex: 1 }} />
                  <Skeleton h={14} w={70} />
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrap rise">
              <table className="data">
                <thead>
                  <tr>
                    <th>Submissão</th>
                    <th style={{ width: 150 }}>Pesquisador</th>
                    <th style={{ width: 110 }}>Severidade</th>
                    <th style={{ width: 120 }}>Recompensa</th>
                    <th style={{ width: 230 }}>Triagem</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((b) => (
                    <BountyRow key={b.id} b={b} busy={busy} onStatus={setBountyStatus} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card card-pad-lg rise" style={{ alignSelf: "start" }}>
          <div className="section-head">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Trophy size={17} color="var(--sev-media)" />
              <h3>Ranking de pesquisadores</h3>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: "10px 0" }}>
                    <Skeleton h={34} />
                  </div>
                ))
              : leaderboard.map((r, i) => (
                  <div
                    key={r.researcher}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "10px 0",
                      borderBottom: i < leaderboard.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <span style={{ width: 20, fontWeight: 800, color: "var(--faint)", fontSize: 13 }}>
                      {i + 1}
                    </span>
                    <img
                      src={avatarUrl(r.researcher)}
                      alt={r.researcher}
                      width={38}
                      height={38}
                      loading="lazy"
                      style={{ borderRadius: "50%", objectFit: "cover", flex: "none", border: "1px solid var(--border)" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.researcher}</div>
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>Pesquisador externo</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: "var(--accent)" }}>
                      {fmtBRL(r.total)}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function BountyRow({
  b,
  busy,
  onStatus,
}: {
  b: Bounty;
  busy: boolean;
  onStatus: (id: string, s: BountyStatus) => void;
}) {
  return (
    <tr style={{ cursor: "default" }}>
      <td>
        <div className="cell-title">{b.title}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
          <span className="cell-area">{b.area}</span>
          <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{fmtDate(b.submitted)}</span>
        </div>
        {b.duplicateOf && (
          <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 3 }}>
            Duplicada de {b.duplicateOf}
          </div>
        )}
      </td>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img
            src={avatarUrl(b.researcher)}
            alt={b.researcher}
            width={30}
            height={30}
            loading="lazy"
            style={{ borderRadius: "50%", objectFit: "cover", flex: "none", border: "1px solid var(--border)" }}
          />
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{b.researcher}</span>
        </div>
      </td>
      <td>
        <SeverityPill s={b.severity} />
      </td>
      <td style={{ fontWeight: 700, color: b.payout > 0 ? "var(--text)" : "var(--faint)" }}>
        {b.payout > 0 ? fmtBRL(b.payout) : "-"}
      </td>
      <td>
        {b.status === "triagem" ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onStatus(b.id, "aceito")}>
              <Check size={14} /> Aceitar
            </button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onStatus(b.id, "duplicado")}>
              <Copy size={14} /> Duplicada
            </button>
            <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => onStatus(b.id, "inválido")}>
              <Ban size={14} />
            </button>
          </div>
        ) : b.status === "aceito" ? (
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => onStatus(b.id, "pago")}>
            <BadgeDollarSign size={14} /> Pagar
          </button>
        ) : (
          <BountyStatusPill s={b.status} />
        )}
      </td>
    </tr>
  );
}

function Stat({
  icon,
  val,
  label,
  accent,
}: {
  icon: React.ReactNode;
  val: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="card tilt kpi rise">
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-val" style={accent ? { color: "var(--accent)", fontSize: 24 } : undefined}>
        {val}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
