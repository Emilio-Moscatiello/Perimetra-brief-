import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchDomains, fetchSummary } from "@/api/client";
import type { DomainListItem, DomainReport } from "@/types/report";

type Theme = "light" | "dark";

interface AppContextValue {
  domains: DomainListItem[];
  selectedDomain: string;
  setSelectedDomain: (domain: string) => void;
  report: DomainReport | null;
  loading: boolean;
  error: string | null;
  theme: Theme;
  toggleTheme: () => void;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const THEME_KEY = "cybersonar-theme";
const DOMAIN_KEY = "cybersonar-domain";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [domains, setDomains] = useState<DomainListItem[]>([]);
  const [selectedDomain, setSelectedDomainState] = useState<string>(
    () => localStorage.getItem(DOMAIN_KEY) || "cybersonar.demo"
  );
  const [report, setReport] = useState<DomainReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    fetchDomains()
      .then(setDomains)
      .catch(() => setDomains([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSummary(selectedDomain)
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Errore nel caricamento del report");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDomain, refreshTick]);

  const setSelectedDomain = useCallback((domain: string) => {
    setSelectedDomainState(domain);
    localStorage.setItem(DOMAIN_KEY, domain);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const refresh = useCallback(() => setRefreshTick((t) => t + 1), []);

  const value = useMemo(
    () => ({ domains, selectedDomain, setSelectedDomain, report, loading, error, theme, toggleTheme, refresh }),
    [domains, selectedDomain, setSelectedDomain, report, loading, error, theme, toggleTheme, refresh]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
