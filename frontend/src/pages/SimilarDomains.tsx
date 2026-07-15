import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useResource } from "@/hooks/useResource";
import { fetchSimilarDomains } from "@/api/client";
import { LoadingCard, ErrorState } from "@/components/LoadingState";
import { DataTable, type Column } from "@/components/DataTable";
import type { SimilarDomainItem } from "@/types/report";

export function SimilarDomains() {
  const { selectedDomain } = useApp();
  const { data, loading, error } = useResource(() => fetchSimilarDomains(selectedDomain), [selectedDomain]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.items.filter((d) => !search || d.domain.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const columns: Column<SimilarDomainItem>[] = [
    { key: "domain", header: "Dominio simile", render: (r) => <span className="mono">{r.domain}</span> },
    {
      key: "similarity",
      header: "Similarità",
      render: (r) => `${Math.round(r.similarity * 100)}%`,
      width: "110px",
    },
    {
      key: "registered",
      header: "Registrato",
      render: (r) => (
        <span style={{ color: r.registered ? "var(--status-critical)" : "var(--text-muted)", fontWeight: 600 }}>
          {r.registered ? "Sì" : "No"}
        </span>
      ),
      width: "110px",
    },
    { key: "risk", header: "Segnale di rischio", render: (r) => r.risk },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Domini simili</h1>
          <p>Domini potenzialmente utilizzati per phishing o typosquatting contro {selectedDomain}</p>
        </div>
      </div>

      <div className="filter-row">
        <input
          className="text-input"
          placeholder="Cerca dominio…"
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
        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.domain} />
      )}
    </div>
  );
}
