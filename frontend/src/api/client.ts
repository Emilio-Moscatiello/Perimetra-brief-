import type {
  DomainListItem,
  DomainReport,
  HistoryPoint,
  VulnerabilitiesResponse,
  DataLeaksResponse,
  SimilarDomainsResponse,
} from "@/types/report";

const BASE = "/api";

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchDomains(): Promise<DomainListItem[]> {
  const data = await getJSON<{ results: DomainListItem[] }>("/domains");
  return data.results;
}

export async function fetchSummary(domain: string): Promise<DomainReport> {
  const data = await getJSON<{ results: DomainReport[] }>(`/summary?domain=${encodeURIComponent(domain)}`);
  return data.results[0];
}

export async function fetchHistory(domain: string, days = 90): Promise<HistoryPoint[]> {
  const data = await getJSON<{ points: HistoryPoint[] }>(`/history?domain=${encodeURIComponent(domain)}&days=${days}`);
  return data.points;
}

export async function fetchVulnerabilities(domain: string): Promise<VulnerabilitiesResponse> {
  return getJSON<VulnerabilitiesResponse>(`/vulnerabilities?domain=${encodeURIComponent(domain)}`);
}

export async function fetchDataLeaks(domain: string): Promise<DataLeaksResponse> {
  return getJSON<DataLeaksResponse>(`/dataleaks?domain=${encodeURIComponent(domain)}`);
}

export async function fetchSimilarDomains(domain: string): Promise<SimilarDomainsResponse> {
  return getJSON<SimilarDomainsResponse>(`/similar?domain=${encodeURIComponent(domain)}`);
}
