import { useEffect, useState, useSyncExternalStore } from "react";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  source: "tap" | "voice" | "receipt";
  createdAt: string;
};

export type AppState = {
  startingBalance: number | null;
  allowanceDate: string | null; // ISO YYYY-MM-DD
  expenses: Expense[];
};

const KEY = "duitwise-snap-state-v1";

const initial: AppState = {
  startingBalance: null,
  allowanceDate: null,
  expenses: [],
};

let state: AppState = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial, ...JSON.parse(raw) };
  } catch {}
  loaded = true;
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(state));
}

function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAppState() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    load();
    setHydrated(true);
    listeners.forEach((l) => l());
  }, []);
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
  return { state: hydrated ? snap : initial, hydrated };
}

export const actions = {
  setup(balance: number, date: string) {
    setState((s) => ({ ...s, startingBalance: balance, allowanceDate: date, expenses: [] }));
  },
  addExpense(amount: number, category: string, source: Expense["source"]) {
    const e: Expense = {
      id: Math.random().toString(36).slice(2),
      amount,
      category,
      source,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, expenses: [e, ...s.expenses] }));
    return e;
  },
  reset() {
    setState(() => ({ ...initial }));
  },
};

export function computeRemaining(s: AppState) {
  const spent = s.expenses.reduce((a, e) => a + e.amount, 0);
  return (s.startingBalance ?? 0) - spent;
}

export function daysLeft(s: AppState) {
  if (!s.allowanceDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(s.allowanceDate);
  target.setHours(0, 0, 0, 0);
  const ms = target.getTime() - today.getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}

export function detectExpense(text: string): { amount: number | null; category: string } {
  const m = text.match(/(?:rm)?\s*(\d+(?:\.\d{1,2})?)/i);
  const amount = m ? parseFloat(m[1]) : null;
  const t = text.toLowerCase();
  const map: [RegExp, string][] = [
    [/\b(lunch|dinner|food|nasi|meal|breakfast|makan)\b/, "Food"],
    [/\b(drink|coffee|tea|milo|kopi|juice)\b/, "Drink"],
    [/\b(grab|bus|transport|fuel|petrol|taxi|train|lrt)\b/, "Transport"],
    [/\b(print|printing|photocopy|academic)\b/, "Academic"],
    [/\b(laundry|wash)\b/, "Laundry"],
    [/\b(shopping|clothes|item|baju|shoe)\b/, "Shopping"],
  ];
  for (const [re, cat] of map) if (re.test(t)) return { amount, category: cat };
  return { amount, category: "Other" };
}
