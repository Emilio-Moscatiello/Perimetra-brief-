import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useResource } from "@/hooks/useResource";
import { fetchVulnerabilities } from "@/api/client";
import { LoadingCard, ErrorState } from "@/components/LoadingState";
import { DataTable, type Column } from "@/components/DataTable";
import { HorizontalBarChart } from "@/components/HorizontalBarChart";
import { SEVERITY_LABEL_IT, severityColor } from "@/lib/colors";
import type { Severity, VulnerabilityItem } from "@/types/report";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

export function Vulnerabilities() {
  const { selectedDomain } = useApp();
  const { data, loading, error } = useResource(() => fetchVulnerabilities(selectedDomain), [selectedDomain]);
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "passive">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.items.filter((v) => {
      if (severityFilter !== "all" && v.severity !== severityFilter) return false;
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (search && !`${v.title} ${v.asset} ${v.id}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, severityFilter, statusFilter, search]);

  const bySeverity = useMemo(() => {
    if (!data) return [];
    const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    data.items.forEach((v) => counts[v.severity]++);
    return SEVERITIES.map((sev) => ({
      label: SEVERITY_LABEL_IT[sev],
      value: counts[sev],
      color: severityColor(sev),
      detail: `${counts[sev]} rilevate`,
    }));
  }, [data]);

  const columns: Column<VulnerabilityItem>[] = [
    { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span>, width: "140px" },
    {
      key: "severity",
      header: "Gravità",
      render: (r) => (
        <span className="status-pill" style={{ color: severityColor(r.severity), background: "var(--surface-2)" }}>
          {SEVERITY_LABEL_IT[r.severity]}
        </span>
      ),
      width: "110px",
    },
    { key: "title", header: "Titolo", render: (r) => r.title },
    { key: "asset", header: "Asset", render: (r) => <span className="mono">{r.asset}</span> },
    {
      key: "status",
      header: "Stato",
      render: (r) => (r.status === "active" ? "Attiva" : "Passiva"),
      width: "90px",
    },
    { key: "detected_at", header: "Rilevata", render: (r) => <span className="mono">{r.detected_at}</span>, width: "110px" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Vulnerabilità</h1>
          <p>{data ? `${data.total} vulnerabilità rilevate su ${selectedDomain}` : "Caricamento…"}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Distribuzione per gravità</div>
        {loading || !data ? <LoadingCard height={180} /> : <HorizontalBarChart data={bySeverity} />}
      </div>

      <div className="filter-row">
        <select className="select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}>
          <option value="all">Tutte le gravità</option>
          {SEVERITIES.map((sev) => (
            <option key={sev} value={sev}>
              {SEVERITY_LABEL_IT[sev]}
            </option>
          ))}
        </select>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Attive e passive</option>
          <option value="active">Solo attive</option>
          <option value="passive">Solo passive</option>
        </select>
        <input
          className="text-input"
          placeholder="Cerca per titolo, asset o ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{filtered.length} risultati</span>
      </div>

      {loading ? (
        <LoadingCard height={320} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} />
      )}
    </div>
  );
}
