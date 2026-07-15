import type { LeakCategory, Severity } from "@/types/report";

export type StatusKey = "good" | "warning" | "serious" | "critical";

export const STATUS_VAR: Record<StatusKey, string> = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  serious: "var(--status-serious)",
  critical: "var(--status-critical)",
};

export const STATUS_LABEL_IT: Record<StatusKey, string> = {
  good: "Solido",
  warning: "Attenzione",
  serious: "Elevato",
  critical: "Critico",
};

export function scoreToStatus(score: number): StatusKey {
  if (score >= 75) return "critical";
  if (score >= 50) return "serious";
  if (score >= 25) return "warning";
  return "good";
}

export const SEVERITY_STATUS: Record<Severity, StatusKey> = {
  critical: "critical",
  high: "serious",
  medium: "warning",
  low: "good",
  info: "good",
};

export const SEVERITY_LABEL_IT: Record<Severity, string> = {
  critical: "Critica",
  high: "Alta",
  medium: "Media",
  low: "Bassa",
  info: "Info",
};

export function severityColor(sev: Severity): string {
  return STATUS_VAR[SEVERITY_STATUS[sev]];
}

const CATEGORICAL = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

export const LEAK_CATEGORY_ORDER: LeakCategory[] = [
  "domain_stealer",
  "potential_stealer",
  "other_stealer",
  "vip",
  "general_leak",
];

export const LEAK_CATEGORY_LABEL_IT: Record<LeakCategory, string> = {
  domain_stealer: "Domain stealer",
  potential_stealer: "Potential stealer",
  other_stealer: "Other stealer",
  vip: "VIP",
  general_leak: "General leak",
};

export function leakCategoryColor(cat: LeakCategory): string {
  const idx = LEAK_CATEGORY_ORDER.indexOf(cat);
  return CATEGORICAL[idx % CATEGORICAL.length];
}

export function categoricalColor(index: number): string {
  return CATEGORICAL[index % CATEGORICAL.length];
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("it-IT", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}
