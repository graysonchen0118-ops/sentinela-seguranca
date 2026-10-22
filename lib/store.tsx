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
import { SECRECY } from "./mock/secrecy";
import { HANDS } from "./mock/hands";
import { PLAYERS } from "./mock/players";
import type {
  Finding,
  FindingStatus,
  SecrecyCheck,
  Hand,
  FlaggedPlayer,
  FlagStatus,
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
  secrecy: SecrecyCheck[];
  hands: Hand[];
  players: FlaggedPlayer[];
  busy: boolean;
  toasts: Toast[];
  addFinding: (f: Omit<Finding, "id" | "discovered" | "status">) => Promise<void>;
  setFindingStatus: (id: string, status: FindingStatus) => Promise<void>;
  deleteFinding: (id: string) => Promise<void>;
  resolveSecrecy: (id: string) => Promise<void>;
  verifyHand: (id: string) => Promise<void>;
  setPlayerStatus: (id: string, status: FlagStatus) => Promise<void>;
  dismissToast: (id: number) => void;
}

const StoreContext = createContext<StoreValue | null>(null);
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [findings, setFindings] = useState<Finding[]>(FINDINGS);
  const [secrecy, setSecrecy] = useState<SecrecyCheck[]>(SECRECY);
  const [hands, setHands] = useState<Hand[]>(HANDS);
  const [players, setPlayers] = useState<FlaggedPlayer[]>(PLAYERS);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let active = true;
    const t = setTimeout(() => active && setLoading(false), 650);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  const pushToast = useCallback((message: string, kind: ToastKind = "ok") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const addFinding = useCallback<StoreValue["addFinding"]>(
    async (f) => {
      setBusy(true);
      await delay(520);
      setFindings((list) => {
        const id = "SEN-" + String(list.length + 1).padStart(3, "0");
        return [{ ...f, id, status: "aberto", discovered: today() }, ...list];
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
      setFindings((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
      setBusy(false);
      if (status === "reteste_ok") pushToast("Reteste aprovado, a brecha fechou de verdade", "ok");
      else if (status === "corrigido") pushToast("Marcado como corrigido, agora vai para reteste", "info");
      else pushToast("Status atualizado", "info");
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

  const resolveSecrecy = useCallback<StoreValue["resolveSecrecy"]>(
    async (id) => {
      setBusy(true);
      await delay(460);
      setSecrecy((list) =>
        list.map((x) => (x.id === id ? { ...x, status: "corrigido" } : x))
      );
      setBusy(false);
      pushToast("Canal fechado, a carta privada não passa mais por aí", "ok");
    },
    [pushToast]
  );

  const verifyHand = useCallback<StoreValue["verifyHand"]>(
    async (id) => {
      setBusy(true);
      await delay(520);
      setHands((list) => list.map((x) => (x.id === id ? { ...x, verificado: true } : x)));
      setBusy(false);
      pushToast("Mão verificada, baralho íntegro e não previsível", "ok");
    },
    [pushToast]
  );

  const setPlayerStatus = useCallback<StoreValue["setPlayerStatus"]>(
    async (id, status) => {
      setBusy(true);
      await delay(420);
      setPlayers((list) => list.map((x) => (x.id === id ? { ...x, status } : x)));
      setBusy(false);
      if (status === "restrito") pushToast("Conta restrita para revisão", "warn");
      else if (status === "limpo") pushToast("Conta liberada, sinal sem fundamento", "info");
      else pushToast("Conta atualizada", "info");
    },
    [pushToast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      loading,
      findings,
      secrecy,
      hands,
      players,
      busy,
      toasts,
      addFinding,
      setFindingStatus,
      deleteFinding,
      resolveSecrecy,
      verifyHand,
      setPlayerStatus,
      dismissToast,
    }),
    [
      loading,
      findings,
      secrecy,
      hands,
      players,
      busy,
      toasts,
      addFinding,
      setFindingStatus,
      deleteFinding,
      resolveSecrecy,
      verifyHand,
      setPlayerStatus,
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
