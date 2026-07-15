import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useResource } from "@/hooks/useResource";
import { fetchDataLeaks } from "@/api/client";
import { LoadingCard, ErrorState } from "@/components/LoadingState";
import { DataTable, type Column } from "@/components/DataTable";
import { StackedBar } from "@/components/StackedBar";
import { LEAK_CATEGORY_ORDER, LEAK_CATEGORY_LABEL_IT, leakCategoryColor } from "@/lib/colors";
import type { DataLeakItem, LeakCategory } from "@/types/report";

export function DataLeaks() {
  const { selectedDomain } = useApp();
  const { data, loading, error } = useResource(() => fetchDataLeaks(selectedDomain), [selectedDomain]);
  const [categoryFilter, setCategoryFilter] = useState<LeakCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.items.filter((l) => {
      if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (search && !`${l.identifier} ${l.source}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, categoryFilter, statusFilter, search]);

  const categorySegments = useMemo(() => {
    if (!data) return [];
    return LEAK_CATEGORY_ORDER.map((cat) => ({
      key: cat,
      label: LEAK_CATEGORY_LABEL_IT[cat],
      value: data.totals.total[cat],
      color: leakCategoryColor(cat),
    }));
  }, [data]);

  const resolvedSegments = useMemo(() => {
    if (!data) return [];
    const resolved = Object.values(data.totals.resolved).reduce((a, b) => a + b, 0);
    const unresolved = Object.values(data.totals.unresolved).reduce((a, b) => a + b, 0);
    return [
      { key: "resolved", label: "Risolti", value: resolved, color: "var(--status-good)" },
      { key: "unresolved", label: "Non risolti", value: unresolved, color: "var(--status-critical)" },
    ];
  }, [data]);

  const columns: Column<DataLeakItem>[] = [
    { key: "id", header: "ID", render: (r) => <span className="mono">{r.id}</span>, width: "150px" },
    {
      key: "category",
      header: "Categoria",
      render: (r) => (
        <span className="status-pill" style={{ color: leakCategoryColor(r.category), background: "var(--surface-2)" }}>
          {LEAK_CATEGORY_LABEL_IT[r.category]}
        </span>
      ),
    },
    { key: "identifier", header: "Identificativo", render: (r) => <span className="mono">{r.identifier}</span> },
    { key: "source", header: "Fonte", render: (r) => r.source },
    {
      key: "status",
      header: "Stato",
      render: (r) => (
        <span style={{ color: r.status === "resolved" ? "var(--status-good)" : "var(--status-critical)", fontWeight: 600 }}>
          {r.status === "resolved" ? "Risolto" : "Non risolto"}
        </span>
      ),
      width: "110px",
    },
    { key: "detected_at", header: "Rilevato", render: (r) => <span className="mono">{r.detected_at}</span>, width: "110px" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Data Leak</h1>
          <p>{data ? `Campione di ${data.items.length} record su un totale stimato di ${Object.values(data.totals.total).reduce((a, b) => a + b, 0)}` : "Caricamento…"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Per categoria</div>
          {loading || !data ? <LoadingCard height={100} /> : <StackedBar segments={categorySegments} />}
        </div>
        <div className="card">
          <div className="card-title">Stato di risoluzione</div>
          {loading || !data ? <LoadingCard height={100} /> : <StackedBar segments={resolvedSegments} />}
        </div>
      </div>

      <div className="filter-row">
        <select className="select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as LeakCategory | "all")}>
          <option value="all">Tutte le categorie</option>
          {LEAK_CATEGORY_ORDER.map((cat) => (
            <option key={cat} value={cat}>
              {LEAK_CATEGORY_LABEL_IT[cat]}
            </option>
          ))}
        </select>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
          <option value="all">Risolti e non risolti</option>
          <option value="resolved">Solo risolti</option>
          <option value="unresolved">Solo non risolti</option>
        </select>
        <input
          className="text-input"
          placeholder="Cerca per identificativo o fonte…"
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
