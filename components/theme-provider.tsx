"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "tools-library-theme";

const ThemeContext = createContext<{
  /** Effective theme (manual choice or OS when unset). */
  resolvedTheme: ResolvedTheme;
  /** `true` when no manual choice is saved — follows system light/dark. */
  followsSystem: boolean;
  toggleTheme: () => void;
} | null>(null);

function applyResolvedTheme(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

/** `null` = not set, use system preference. */
function readStoredPreference(): "light" | "dark" | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "light" || v === "dark") return v;
    /* legacy: explicit system or unknown → treat as unset */
  } catch {
    /* ignore */
  }
  return null;
}

function subscribeSystemTheme(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getSystemResolved(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [storedPreference, setStoredPreference] = useState<
    "light" | "dark" | null
  >(null);

  const systemResolved = useSyncExternalStore(
    subscribeSystemTheme,
    getSystemResolved,
    () => "light" as const,
  );

  const resolvedTheme: ResolvedTheme =
    storedPreference ?? systemResolved;

  const followsSystem = storedPreference === null;

  useLayoutEffect(() => {
    // Hydrate manual preference from localStorage (cannot read in SSR initial state).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync stored choice on mount
    setStoredPreference(readStoredPreference());
  }, []);

  useLayoutEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setStoredPreference((prev) => {
      const resolved =
        prev ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
      const next: "light" | "dark" = resolved === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ resolvedTheme, followsSystem, toggleTheme }),
    [resolvedTheme, followsSystem, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
