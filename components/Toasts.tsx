"use client";

import { Check, Info, TriangleAlert } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.kind}`} onClick={() => dismissToast(t.id)}>
          <span className="t-icon">
            {t.kind === "ok" ? (
              <Check size={15} />
            ) : t.kind === "warn" ? (
              <TriangleAlert size={15} />
            ) : (
              <Info size={15} />
            )}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
