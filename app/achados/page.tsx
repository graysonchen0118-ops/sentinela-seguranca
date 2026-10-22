"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  X,
  Search,
  Bug,
  Trash2,
  ShieldCheck,
  Wrench,
  RotateCcw,
  SearchX,
} from "lucide-react";
import Shell from "@/components/Shell";
import {
  SeverityPill,
  StatusPill,
  Skeleton,
  fmtDate,
} from "@/components/ui";
import { useStore } from "@/lib/store";
import {
  SEVERITIES,
  SEVERITY_LABEL,
  SEVERITY_WEIGHT,
  type Category,
  type Finding,
  type FindingStatus,
  type Severity,
} from "@/lib/types";

const CATEGORIES: Category[] = [
  "Sigilo de Cartas",
  "Aleatoriedade (RNG)",
  "Integridade da Partida",
  "Colusão e Bots",
  "Caixa e Saques",
  "Controle de Acesso",
  "Configuração",
];

const STATUS_FLOW: { key: FindingStatus; label: string; icon: React.ReactNode }[] = [
  { key: "em_correcao", label: "Em correção", icon: <Wrench size={15} /> },
  { key: "corrigido", label: "Marcar corrigido", icon: <ShieldCheck size={15} /> },
  { key: "reteste_ok", label: "Reteste OK", icon: <RotateCcw size={15} /> },
];

export default function AchadosPage() {
  return (
    <Shell
      title="Achados"
      subtitle="Cada vulnerabilidade com o risco real e o conserto ao lado"
    >
      <Suspense fallback={<TableSkeleton />}>
        <AchadosInner />
      </Suspense>
    </Shell>
  );
}

function AchadosInner() {
  const params = useSearchParams();
  const { loading, findings, busy, setFindingStatus, deleteFinding } = useStore();

  const [query, setQuery] = useState("");
  const [sev, setSev] = useState<Severity | "todas">("todas");
  const [cat, setCat] = useState<string>("todas");
  const [status, setStatus] = useState<string>("todos");
  const [sort, setSort] = useState<"risco" | "recente">("risco");
  const [selected, setSelected] = useState<Finding | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const c = params.get("cat");
    if (c) setCat(c);
    const f = params.get("f");
    if (f) {
      const found = findings.find((x) => x.id === f);
      if (found) setSelected(found);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = findings.filter((f) => {
      if (sev !== "todas" && f.severity !== sev) return false;
      if (cat !== "todas" && f.category !== cat) return false;
      if (status !== "todos" && f.status !== status) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !f.title.toLowerCase().includes(q) &&
          !f.area.toLowerCase().includes(q) &&
          !f.id.toLowerCase().includes(q) &&
          !f.category.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
    list = [...list].sort((a, b) =>
      sort === "risco"
        ? SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity] ||
          b.discovered.localeCompare(a.discovered)
        : b.discovered.localeCompare(a.discovered)
    );
    return list;
  }, [findings, sev, cat, status, query, sort]);

  // keep the open drawer in sync after a status change
  const live = selected ? findings.find((f) => f.id === selected.id) ?? null : null;

  return (
    <>
      <div className="toolbar">
        <div className="search-box" style={{ display: "flex" }}>
          <Search size={16} />
          <input
            placeholder="Buscar por título, rota ou ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ flex: 1 }} />
        <select className="select" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="todas">Todas as categorias</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="todos">Todos os status</option>
          <option value="aberto">Aberto</option>
          <option value="em_correcao">Em correção</option>
          <option value="corrigido">Corrigido</option>
          <option value="reteste_ok">Reteste OK</option>
        </select>
        <select className="select" value={sort} onChange={(e) => setSort(e.target.value as "risco" | "recente")}>
          <option value="risco">Ordenar por risco</option>
          <option value="recente">Mais recentes</option>
        </select>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          <Plus size={16} /> Novo achado
        </button>
      </div>

      <div className="toolbar" style={{ gap: 8 }}>
        <button
          className={`filter-chip ${sev === "todas" ? "on" : ""}`}
          onClick={() => setSev("todas")}
        >
          Todas ({findings.length})
        </button>
        {SEVERITIES.map((s) => (
          <button
            key={s}
            className={`filter-chip ${sev === s ? "on" : ""}`}
            onClick={() => setSev(s)}
          >
            {SEVERITY_LABEL[s]} ({findings.filter((f) => f.severity === s).length})
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">
              <SearchX size={24} />
            </div>
            <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
              Nenhum achado com esse filtro
            </div>
            <div style={{ fontSize: 13.5 }}>Ajuste a busca ou limpe os filtros.</div>
          </div>
        </div>
      ) : (
        <div className="table-wrap rise">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th>Achado</th>
                <th style={{ width: 170 }}>Categoria</th>
                <th style={{ width: 130 }}>Severidade</th>
                <th style={{ width: 130 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} onClick={() => setSelected(f)}>
                  <td className="cell-id">{f.id}</td>
                  <td>
                    <div className="cell-title">{f.title}</div>
                    <div className="cell-area">{f.area}</div>
                  </td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{f.category}</td>
                  <td>
                    <SeverityPill s={f.severity} />
                  </td>
                  <td>
                    <StatusPill s={f.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {live && (
        <FindingDrawer
          f={live}
          busy={busy}
          onClose={() => setSelected(null)}
          onStatus={(s) => setFindingStatus(live.id, s)}
          onDelete={async () => {
            await deleteFinding(live.id);
            setSelected(null);
          }}
        />
      )}

      {creating && <CreateDrawer onClose={() => setCreating(false)} />}
    </>
  );
}

function FindingDrawer({
  f,
  busy,
  onClose,
  onStatus,
  onDelete,
}: {
  f: Finding;
  busy: boolean;
  onClose: () => void;
  onStatus: (s: FindingStatus) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Detalhe do achado">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="cell-id">{f.id}</span>
            <SeverityPill s={f.severity} />
            <StatusPill s={f.status} />
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={onClose} aria-label="Fechar">
              <X size={17} />
            </button>
          </div>
          <h2 style={{ fontSize: 18, margin: "12px 0 0", lineHeight: 1.25 }}>{f.title}</h2>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 10,
              fontSize: 12.5,
              color: "var(--muted)",
              flexWrap: "wrap",
            }}
          >
            <span>Categoria: {f.category}</span>
            <span>Responsável: {f.owner}</span>
            <span>Encontrado em {fmtDate(f.discovered)}</span>
          </div>
        </div>

        <div className="drawer-body">
          <div className="def">
            <dt>Rota ou área</dt>
            <dd className="cell-area" style={{ color: "var(--text)" }}>
              {f.area}
            </dd>
          </div>
          <div className="def">
            <dt>O que é</dt>
            <dd>{f.description}</dd>
          </div>
          <div className="callout">
            <span className="callout-label" style={{ color: "var(--sev-critica)" }}>
              Risco para o negócio
            </span>
            {f.risk}
          </div>
          <div className="callout fix">
            <span className="callout-label" style={{ color: "var(--ok)" }}>
              Como fechar
            </span>
            {f.fix}
          </div>
          <div className="def">
            <dt>Reprodução</dt>
            <dd style={{ color: "var(--muted)", fontSize: 13.5 }}>{f.reproducao}</dd>
          </div>

          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 9 }}>
              Mover para
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STATUS_FLOW.map((s) => (
                <button
                  key={s.key}
                  className="btn btn-ghost btn-sm"
                  disabled={busy || f.status === s.key}
                  onClick={() => onStatus(s.key)}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-danger btn-sm"
            style={{ alignSelf: "flex-start", marginTop: 4 }}
            disabled={busy}
            onClick={onDelete}
          >
            <Trash2 size={15} /> Remover achado
          </button>
        </div>
      </aside>
    </>
  );
}

function CreateDrawer({ onClose }: { onClose: () => void }) {
  const { addFinding, busy } = useStore();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Sigilo de Cartas");
  const [severity, setSeverity] = useState<Severity>("alta");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [risk, setRisk] = useState("");
  const [fix, setFix] = useState("");
  const [owner, setOwner] = useState("Backend");

  const valid = title.trim().length > 3 && area.trim().length > 1;

  const submit = async () => {
    if (!valid) return;
    await addFinding({
      title: title.trim(),
      category,
      severity,
      area: area.trim(),
      description: description.trim() || "Descrição a detalhar no relatório.",
      risk: risk.trim() || "Risco a ser avaliado.",
      fix: fix.trim() || "Correção a definir com o time.",
      reproducao: "Passo a passo no relatório.",
      owner,
    });
    onClose();
  };

  return (
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Novo achado">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="brand-mark" style={{ width: 32, height: 32, borderRadius: 9 }}>
              <Bug size={17} />
            </span>
            <h2 style={{ fontSize: 17, margin: 0 }}>Novo achado</h2>
            <div style={{ flex: 1 }} />
            <button className="icon-btn" onClick={onClose} aria-label="Fechar">
              <X size={17} />
            </button>
          </div>
        </div>
        <div className="drawer-body">
          <div className="field">
            <label>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: acesso a dado de outro usuário pelo ID"
            />
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Severidade</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {SEVERITY_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Rota ou área</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="GET /api/..."
              />
            </div>
            <div className="field">
              <label>Responsável</label>
              <select value={owner} onChange={(e) => setOwner(e.target.value)}>
                <option>Backend</option>
                <option>Frontend</option>
                <option>Infraestrutura</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>O que é</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field">
            <label>Risco para o negócio</label>
            <textarea value={risk} onChange={(e) => setRisk(e.target.value)} />
          </div>
          <div className="field">
            <label>Como fechar</label>
            <textarea value={fix} onChange={(e) => setFix(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-primary" disabled={!valid || busy} onClick={submit}>
              {busy ? "Salvando..." : "Registrar achado"}
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

function TableSkeleton() {
  return (
    <div className="card">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 14,
            padding: "13px 0",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Skeleton h={14} w={60} />
          <Skeleton h={14} w="45%" />
          <div style={{ flex: 1 }} />
          <Skeleton h={14} w={80} />
        </div>
      ))}
    </div>
  );
}
