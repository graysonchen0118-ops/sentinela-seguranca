"use client";

import { useMemo } from "react";
import {
  Shuffle,
  Lock,
  Unlock,
  CheckCircle2,
  BadgeCheck,
  Dice5,
} from "lucide-react";
import Shell from "@/components/Shell";
import { Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { Hand } from "@/lib/types";

export default function BaralhoPage() {
  const { loading, hands, busy, verifyHand } = useStore();

  const verificadas = hands.filter((h) => h.verificado).length;
  const emJogo = hands.filter((h) => h.status === "em_jogo").length;
  const pendentes = hands.filter((h) => h.status === "encerrada" && !h.verificado).length;

  const list = useMemo(() => {
    const rank = (h: Hand) => (h.status === "em_jogo" ? 2 : !h.verificado ? 1 : 0);
    return [...hands].sort((a, b) => rank(b) - rank(a) || b.quando.localeCompare(a.quando));
  }, [hands]);

  return (
    <Shell
      title="Baralho justo"
      subtitle="Compromisso antes da mão, revelação e verificação depois"
    >
      <div className="grid kpi-grid">
        <Stat icon={<BadgeCheck size={18} />} n={verificadas} label="Mãos verificadas" accent />
        <Stat icon={<Lock size={18} />} n={emJogo} label="Em jogo, semente selada" />
        <Stat icon={<Dice5 size={18} />} n={pendentes} label="Aguardam verificação" />
      </div>

      <div className="insight">
        <span className="insight-mark" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
          <Shuffle size={20} />
        </span>
        <div>
          <h4>Não dá pra prever a próxima carta, e dá pra provar</h4>
          <p>
            Antes da mão, o servidor tranca o baralho e publica só a impressão digital dele. A
            semente do jogador entra na mistura, então nem o site decide sozinho. No fim, a semente
            do servidor é revelada e qualquer um refaz a conta: o baralho era aquele, não mudou, e
            ninguém tinha como adivinhar.
          </p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        <Step n="1" title="Compromisso" text="O servidor embaralha e publica o hash do baralho antes de distribuir. Trancado." icon={<Lock size={16} />} />
        <Step n="2" title="A mão acontece" text="Ninguém, nem o servidor, pode trocar a ordem sem quebrar o hash já publicado." icon={<Shuffle size={16} />} />
        <Step n="3" title="Revelação e prova" text="No fim, a semente é revelada e qualquer um confere que o baralho bate com o compromisso." icon={<Unlock size={16} />} />
      </div>

      {loading ? (
        <div className="card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "13px 0", borderBottom: "1px solid var(--border)" }}>
              <Skeleton h={14} w={90} />
              <Skeleton h={14} w="40%" />
              <div style={{ flex: 1 }} />
              <Skeleton h={14} w={90} />
            </div>
          ))}
        </div>
      ) : (
        <div className="table-wrap rise">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 120 }}>Mão</th>
                <th>Mesa</th>
                <th style={{ width: 170 }}>Compromisso</th>
                <th style={{ width: 150 }}>Semente do jogador</th>
                <th style={{ width: 210 }}>Verificação</th>
              </tr>
            </thead>
            <tbody>
              {list.map((h) => (
                <tr key={h.id} style={{ cursor: "default" }}>
                  <td className="cell-id">{h.id}</td>
                  <td>
                    <div className="cell-title">{h.mesa}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
                      {h.jogadores} jogadores · {h.quando}
                    </div>
                  </td>
                  <td className="cell-area" style={{ fontSize: 12 }}>
                    {h.serverSeedHash}
                  </td>
                  <td className="cell-area" style={{ fontSize: 12, color: "var(--text)" }}>
                    {h.clientSeed}
                  </td>
                  <td>
                    {h.status === "em_jogo" ? (
                      <span className="st st-em_correcao">
                        <Lock size={12} style={{ marginRight: 4 }} /> Semente selada
                      </span>
                    ) : h.verificado ? (
                      <div>
                        <span className="st st-reteste_ok">
                          <CheckCircle2 size={12} style={{ marginRight: 4 }} /> Verificado
                        </span>
                        <div className="cell-area" style={{ fontSize: 11, marginTop: 4, color: "var(--faint)" }}>
                          {h.serverSeedRevealed}
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => verifyHand(h.id)}>
                        <BadgeCheck size={14} /> Verificar baralho
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Shell>
  );
}

function Step({
  n,
  title,
  text,
  icon,
}: {
  n: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            background: "var(--accent-soft)",
            color: "var(--accent)",
            flex: "none",
          }}
        >
          {icon}
        </span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "var(--faint)" }}>Passo {n}</span>
      </div>
      <div style={{ fontWeight: 700, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}

function Stat({
  icon,
  n,
  label,
  accent,
}: {
  icon: React.ReactNode;
  n: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="card tilt kpi rise">
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-val" style={accent ? { color: "var(--accent)" } : undefined}>
        {n}
      </div>
      <div className="kpi-label">{label}</div>
    </div>
  );
}
