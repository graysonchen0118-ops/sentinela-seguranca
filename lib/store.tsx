"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FINDINGS } from "./mock/findings";
import { ASSETS } from "./mock/assets";
import { BOUNTIES } from "./mock/bounties";
import type {
  Asset,
  Bounty,
  BountyStatus,
  Finding,
  FindingStatus,
} from "./types";

type ToastKind = "ok" | "info" | "warn";
interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface StoreValue {
  loading: boolean;
  findings: Finding[];
  assets: Asset[];
  bounties: Bounty[];
  busy: boolean;
  toasts: Toast[];
  addFinding: (f: Omit<Finding, "id" | "discovered" | "status">) => Promise<void>;
  setFindingStatus: (id: string, status: FindingStatus) => Promise<void>;
  deleteFinding: (id: string) => Promise<void>;
  addAsset: (a: Omit<Asset, "id" | "lastSeen">) => Promise<void>;
  removeAsset: (id: string) => Promise<void>;
  setBountyStatus: (id: string, status: BountyStatus) => Promise<void>;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<Finding[]>(FINDINGS);
  const [assets, setAssets] = useState<Asset[]>(ASSETS);
  const [bounties, setBounties] = useState<Bounty[]>(BOUNTIES);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      if (active) setLoading(false);
    }, 650);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  const pushToast = useCallback((message: string, kind: ToastKind = "ok") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addFinding = useCallback<StoreValue["addFinding"]>(
    async (f) => {
      setBusy(true);
      await delay(520);
      setFindings((list) => {
        const n = list.length + 1;
        const id = "SEN-" + String(n).padStart(3, "0");
        const created: Finding = {
          ...f,
          id,
          status: "aberto",
          discovered: today(),
        };
        return [created, ...list];
      });
      setBusy(false);
      pushToast("Achado registrado na fila de correção", "ok");
    },
    [pushToast]
  );

  const setFindingStatus = useCallback<StoreValue["setFindingStatus"]>(
    async (id, status) => {
      setBusy(true);
      await delay(420);
      setFindings((list) =>
        list.map((x) => (x.id === id ? { ...x, status } : x))
      );
      setBusy(false);
      if (status === "reteste_ok") {
        pushToast("Reteste aprovado, a brecha fechou de verdade", "ok");
      } else if (status === "corrigido") {
        pushToast("Marcado como corrigido, agora vai para reteste", "info");
      } else {
        pushToast("Status atualizado", "info");
      }
    },
    [pushToast]
  );

  const deleteFinding = useCallback<StoreValue["deleteFinding"]>(
    async (id) => {
      setBusy(true);
      await delay(380);
      setFindings((list) => list.filter((x) => x.id !== id));
      setBusy(false);
      pushToast("Achado removido do painel", "warn");
    },
    [pushToast]
  );

  const addAsset = useCallback<StoreValue["addAsset"]>(
    async (a) => {
      setBusy(true);
      await delay(520);
      setAssets((list) => {
        const id = "AS-" + String(list.length + 1).padStart(2, "0");
        return [{ ...a, id, lastSeen: today() }, ...list];
      });
      setBusy(false);
      pushToast("Ativo adicionado à superfície de ataque", "ok");
    },
    [pushToast]
  );

  const removeAsset = useCallback<StoreValue["removeAsset"]>(
    async (id) => {
      setBusy(true);
      await delay(360);
      setAssets((list) => list.filter((x) => x.id !== id));
      setBusy(false);
      pushToast("Ativo retirado do inventário", "warn");
    },
    [pushToast]
  );

  const setBountyStatus = useCallback<StoreValue["setBountyStatus"]>(
    async (id, status) => {
      setBusy(true);
      await delay(420);
      setBounties((list) =>
        list.map((x) => (x.id === id ? { ...x, status } : x))
      );
      setBusy(false);
      if (status === "pago") {
        pushToast("Recompensa marcada como paga", "ok");
      } else if (status === "duplicado") {
        pushToast("Marcado como duplicado de um achado da auditoria", "info");
      } else {
        pushToast("Submissão atualizada", "info");
      }
    },
    [pushToast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      loading,
      findings,
      assets,
      bounties,
      busy,
      toasts,
      addFinding,
      setFindingStatus,
      deleteFinding,
      addAsset,
      removeAsset,
      setBountyStatus,
      dismissToast,
    }),
    [
      loading,
      findings,
      assets,
      bounties,
      busy,
      toasts,
      addFinding,
      setFindingStatus,
      deleteFinding,
      addAsset,
      removeAsset,
      setBountyStatus,
      dismissToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de StoreProvider");
  return ctx;
}
