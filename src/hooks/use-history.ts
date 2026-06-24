import { useCallback, useEffect, useState } from "react";

export type HistoryItem = {
  id: string;
  tool: string;
  title: string;
  preview: string;
  createdAt: number;
};

const KEY = "wpa-history";
const MAX = 25;

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HistoryItem[];
  } catch { return []; }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => { setItems(read()); }, []);

  const add = useCallback((entry: Omit<HistoryItem, "id" | "createdAt">) => {
    const item: HistoryItem = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
    const next = [item, ...read()].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setItems([]);
  }, []);

  return { items, add, clear };
}
