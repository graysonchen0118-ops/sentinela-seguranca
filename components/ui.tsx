"use client";

import { useRef, type ReactNode } from "react";
import {
  SEVERITY_LABEL,
  STATUS_LABEL,
  BOUNTY_STATUS_LABEL,
  type Severity,
  type FindingStatus,
  type BountyStatus,
} from "@/lib/types";

export function SeverityPill({ s }: { s: Severity }) {
  return (
    <span className={`pill sev-${s}`}>
      <span className="dot" />
      {SEVERITY_LABEL[s]}
    </span>
  );
}

export function StatusPill({ s }: { s: FindingStatus }) {
  return <span className={`st st-${s}`}>{STATUS_LABEL[s]}</span>;
}

export function BountyStatusPill({ s }: { s: BountyStatus }) {
  return <span className={`st st-${s}`}>{BOUNTY_STATUS_LABEL[s]}</span>;
}

export function Skeleton({
  h = 16,
  w = "100%",
  r = 10,
}: {
  h?: number;
  w?: number | string;
  r?: number;
}) {
  return (
    <div
      className="skel"
      style={{ height: h, width: w, borderRadius: r }}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13.5 }}>{text}</div>
    </div>
  );
}

// Pointer tilt in real perspective.
export function TiltCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(
      2
    )}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-3px)`;
  };
  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div
      ref={ref}
      className={`card tilt ${className}`}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </div>
  );
}

export function fmtBRL(v: number): string {
  if (v === 0) return "R$ 0";
  return "R$ " + v.toLocaleString("pt-BR");
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
