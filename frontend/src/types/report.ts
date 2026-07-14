export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type LeakCategory = "vip" | "domain_stealer" | "potential_stealer" | "other_stealer" | "general_leak";

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface EmailSecurity {
  spoofable: string;
  dmarc_policy: "none" | "quarantine" | "reject" | string;
  blacklist_detections: number;
  blacklist_total_list: number;
  blacklist_detected_list: string[];
}

export interface DataLeakBreakdown {
  vip: number;
  domain_stealer: number;
  potential_stealer: number;
  other_stealer: number;
  general_leak: number;
}

export interface DataLeakSummary {
  total: DataLeakBreakdown;
  resolved: DataLeakBreakdown;
  unresolved: DataLeakBreakdown;
  enumeration: number;
}

export interface VulnSummary {
  total: SeverityCounts;
  active: SeverityCounts;
  passive: SeverityCounts;
}

export interface WafInfo {
  count: number;
  assets: string[];
}

export interface CdnInfo {
  count: number;
  assets: string[];
}

export interface DomainReport {
  idsummary: string;
  summary_text: string;
  summary_text_en: string;
  risk_score: string;
  creation_date: string;
  last_edit: string;
  domain_name: string;
  servizi_esposti_score: number;
  dataleak_score: number;
  rapporto_leak_email_score: number;
  spoofing_score: number;
  open_ports_score: number;
  blacklist_score: number;
  vulnerability_score_active: number;
  vulnerability_score_passive: number;
  certificate_score: number;
  n_port: Record<string, { n: number }>;
  n_cert_attivi: number;
  n_cert_scaduti: number;
  n_asset: number;
  n_similar_domains: number;
  email_security: EmailSecurity;
  n_dataleak: DataLeakSummary;
  n_vulns: VulnSummary;
  waf: WafInfo;
  cdn: CdnInfo;
  unique_ipv4: number;
  unique_ipv6: number;
  label?: string;
}

export interface DomainListItem {
  domain_name: string;
  risk_score: number;
  label: string;
  last_edit: string;
}

export interface HistoryPoint {
  date: string;
  risk_score: number;
}

export interface VulnerabilityItem {
  id: string;
  severity: Severity;
  status: "active" | "passive";
  title: string;
  asset: string;
  detected_at: string;
}

export interface VulnerabilitiesResponse {
  domain_name: string;
  total: number;
  items: VulnerabilityItem[];
}

export interface DataLeakItem {
  id: string;
  category: LeakCategory;
  status: "resolved" | "unresolved";
  source: string;
  identifier: string;
  detected_at: string;
}

export interface DataLeaksResponse {
  domain_name: string;
  totals: DataLeakSummary;
  items: DataLeakItem[];
}

export interface SimilarDomainItem {
  domain: string;
  similarity: number;
  registered: boolean;
  risk: string;
}

export interface SimilarDomainsResponse {
  domain_name: string;
  total: number;
  items: SimilarDomainItem[];
}
