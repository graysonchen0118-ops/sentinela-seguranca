"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  X,
  Globe,
  Server,
  Database,
  LayoutPanelTop,
  Network,
  Boxes,
  Trash2,
  AlertTriangle,
  Radar,
} from "lucide-react";
import Shell from "@/components/Shell";
import { Skeleton, fmtDate } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Asset, AssetKind, Exposure } from "@/lib/types";

const KINDS: AssetKind[] = [
  "domínio",
  "subdomínio",
  "api",
  "servidor",
  "armazenamento",
  "painel",
];
const EXPO: Exposure[] = ["crítico", "alto", "médio", "baixo"];

function kindIcon(k: AssetKind) {
  switch (k) {
    case "domínio":
      return <Globe size={16} />;
    case "subdomínio":
      return <Network size={16} />;
    case "api":
      return <Boxes size={16} />;
    case "servidor":
      return <Server size={16} />;
    case "armazenamento":
      return <Database size={16} />;
    case "painel":
      return <LayoutPanelTop size={16} />;
  }
}

function expoClass(e: Exposure) {
  return e === "crítico" ? "critica" : e === "alto" ? "alta" : e === "médio" ? "media" : "baixa";
}

export default function SuperficiePage() {
  const { loading, assets, busy, addAsset, removeAsset } = useStore();
  const [filter, setFilter] = useState<"todos" | "orfaos" | "critico">("todos");
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => {
    let l = assets;
    if (filter === "orfaos") l = l.filter((a) => a.orphan);
    if (filter === "critico") l = l.filter((a) => a.exposure === "crítico");
    const rank: Record<Exposure, number> = { crítico: 4, alto: 3, médio: 2, baixo: 1 };
    return [...l].sort(
      (a, b) => rank[b.exposure] - rank[a.exposure] || Number(b.orphan) - Number(a.orphan)
    );
  }, [assets, filter]);

  const orphans = assets.filter((a) => a.orphan).length;
  const crit = assets.filter((a) => a.exposure === "crítico").length;

  return (
    <Shell
      title="Superfície de ataque"
      subtitle="Tudo que o mundo de fora alcança em nome da plataforma"
    >
      <div className="grid kpi-grid">
        <Stat icon={<Radar size={18} />} n={assets.length} label="Ativos mapeados" />
        <Stat
          icon={<AlertTriangle size={18} />}
          n={orphans}
          label="Órfãos, ninguém lembrava"
          danger
        />
        <Stat icon={<Server size={18} />} n={crit} label="Exposição crítica" danger />
      </div>

      <div className="insight">
        <span className="insight-mark" style={{ background: "rgba(251,191,36,0.14)", color: "var(--warn)" }}>
          <AlertTriangle size={20} />
        </span>
        <div>
          <h4>Metade do trabalho é achar o que ninguém sabe que está no ar</h4>
          <p>
            O que derruba a plataforma raramente é o sistema principal, é o ambiente de
            teste esquecido, a chave num commit antigo, o subdomínio que ainda responde.
            Os marcados como órfão são exatamente isso.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <button className={`filter-chip ${filter === "todos" ? "on" : ""}`} onClick={() => setFilter("todos")}>
          Todos ({assets.length})
        </button>
        <button className={`filter-chip ${filter === "orfaos" ? "on" : ""}`} onClick={() => setFilter("orfaos")}>
          Órfãos ({orphans})
        </button>
        <button className={`filter-chip ${filter === "critico" ? "on" : ""}`} onClick={() => setFilter("critico")}>
          Crítico ({crit})
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Adicionar ativo
        </button>
      </div>

      {loading ? (
        <div className="grid col-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="card" key={i}>
              <Skeleton h={18} w="60%" />
              <div style={{ height: 12 }} />
              <Skeleton h={12} />
              <div style={{ height: 6 }} />
              <Skeleton h={12} w="80%" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid col-grid">
          {list.map((a) => (
            <div
              key={a.id}
              className="card tilt rise"
              style={
                a.orphan
                  ? { borderColor: "rgba(244,63,94,0.3)" }
                  : undefined
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    flex: "none",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                  }}
                >
                  {kindIcon(a.kind)}
                </span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    className="cell-area"
                    style={{
                      color: "var(--text)",
                      fontSize: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {a.host}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", textTransform: "capitalize" }}>
                    {a.kind}
                  </div>
                </div>
                <span className={`pill sev-${expoClass(a.exposure)}`}>{a.exposure}</span>
              </div>

              <p style={{ fontSize: 13, color: "var(--muted)", margin: "13px 0 0", lineHeight: 1.5 }}>
                {a.note}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                }}
              >
                {a.orphan ? (
                  <span className="pill sev-critica">
                    <AlertTriangle size={12} /> Órfão
                  </span>
                ) : (
                  <span className="st" style={{ fontSize: 11.5 }}>
                    Em uso
                  </span>
                )}
                <span style={{ fontSize: 11.5, color: "var(--faint)" }}>
                  Visto {fmtDate(a.lastSeen)}
                </span>
                <div style={{ flex: 1 }} />
                <button
                  className="icon-btn"
                  disabled={busy}
                  onClick={() => removeAsset(a.id)}
                  aria-label="Remover ativo"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {creating && <AddAssetDrawer onClose={() => setCreating(false)} />}
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

function AddAssetDrawer({ onClose }: { onClose: () => void }) {
  const { addAsset, busy } = useStore();
  const [host, setHost] = useState("");
  const [kind, setKind] = useState<AssetKind>("subdomínio");
  const [exposure, setExposure] = useState<Exposure>("alto");
  const [orphan, setOrphan] = useState(false);
  const [note, setNote] = useState("");

  const valid = host.trim().includes(".");

  const submit = async () => {
    if (!valid) return;
    await addAsset({
      host: host.trim(),
      kind,
      exposure,
      orphan,
      note: note.trim() || "Ativo recém-descoberto, a investigar.",
    });
    onClose();
  };

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Adicionar ativo">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ fontSize: 17, margin: 0 }}>Adicionar ativo</h2>
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={onClose} aria-label="Fechar">
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="drawer-body">
          <div className="field">
            <label>Endereço</label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="ex: antigo.plataforma.com.br"
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Tipo</label>
              <select value={kind} onChange={(e) => setKind(e.target.value as AssetKind)}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Exposição</label>
              <select value={exposure} onChange={(e) => setExposure(e.target.value as Exposure)}>
                {EXPO.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={orphan}
              onChange={(e) => setOrphan(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: "var(--sev-critica)" }}
            />
            Ativo órfão, ninguém lembrava que estava no ar
          </label>
          <div className="field">
            <label>Observação</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={!valid || busy} onClick={submit}>
              {busy ? "Salvando..." : "Adicionar ao inventário"}
            </button>
            <button className="btn btn-ghost" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
