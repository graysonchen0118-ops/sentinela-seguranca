"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  Bug,
  EyeOff,
  Shuffle,
  RefreshCw,
  Menu,
  Search,
  Activity,
} from "lucide-react";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Visão geral", icon: LayoutDashboard },
  { href: "/achados", label: "Achados", icon: Bug },
  { href: "/cartas", label: "Sigilo das cartas", icon: EyeOff },
  { href: "/baralho", label: "Baralho justo", icon: Shuffle },
  { href: "/reteste", label: "Reteste", icon: RefreshCw },
];

export default function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { findings } = useStore();

  const openCrit = findings.filter(
    (f) => f.severity === "critica" && f.status !== "reteste_ok" && f.status !== "corrigido"
  ).length;

  return (
    <div className="app">
      <div className={`scrim ${open ? "show" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck size={21} strokeWidth={2.4} />
          </span>
          <div>
            <div className="brand-name">Sentinela</div>
            <div className="brand-sub">Integridade de jogo</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((n) => {
            const active =
              n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`nav-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} strokeWidth={2.2} />
                <span>{n.label}</span>
                {n.href === "/achados" && openCrit > 0 && (
                  <span className="nav-badge">{openCrit}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          Carta privada não sai do servidor até o showdown.
          <br />
          Baralho justo verificável a cada mão.
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="burger"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1>{title}</h1>
            <div className="page-sub">{subtitle}</div>
          </div>
          <div className="topbar-spacer" />
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Buscar achado, ativo, rota..." aria-label="Buscar" />
          </div>
          <span className="scan-chip">
            <span className="scan-dot" />
            <span>Monitorando</span>
            <Activity size={14} />
          </span>
        </header>

        <div className="content">{children}</div>

        <footer className="site-foot">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span className="brand-mark" style={{ width: 26, height: 26, borderRadius: 8 }}>
              <ShieldCheck size={14} strokeWidth={2.4} />
            </span>
            <span>Sentinela, auditoria e segurança de plataforma</span>
          </div>
          <span>© 2026 Sentinela. Todos os direitos reservados.</span>
        </footer>
      </div>
    </div>
  );
}
