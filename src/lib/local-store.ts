"use client";

import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribeKey(key: string) {
  return (cb: Listener) => {
    let set = listeners.get(key);
    if (!set) listeners.set(key, (set = new Set()));
    set.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      set.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };
}

function read<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

/** localStorage-backed state that stays in sync across components and tabs. */
export function useLocalState<T>(key: string, fallback: T): [T, (updater: (prev: T) => T) => void] {
  const subscribe = useCallback((cb: Listener) => subscribeKey(key)(cb), [key]);
  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback),
    () => fallback,
  );
  const update = useCallback(
    (updater: (prev: T) => T) => {
      const next = updater(read(key, fallback));
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* storage full or blocked; keep the in-memory view only */
      }
      listeners.get(key)?.forEach((l) => l());
    },
    [key, fallback],
  );
  return [value, update];
}
