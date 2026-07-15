import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { StatTile } from "@/components/StatTile";
import { HorizontalBarChart } from "@/components/HorizontalBarChart";
import { LoadingCard, ErrorState } from "@/components/LoadingState";

const PORT_SERVICE: Record<string, string> = {
  "21": "FTP",
  "22": "SSH",
  "25": "SMTP",
  "53": "DNS",
  "80": "HTTP",
  "443": "HTTPS",
  "3306": "MySQL",
  "3389": "RDP",
  "6667": "IRC",
  "6697": "IRC (TLS)",
  "8080": "HTTP alt",
  "8800": "HTTP alt",
};

export function Network() {
  const { report, loading, error } = useApp();

  const portData = useMemo(() => {
    if (!report) return [];
    return Object.entries(report.n_port)
      .map(([port, v]) => ({
        label: `${port} · ${PORT_SERVICE[port] || "sconosciuto"}`,
        value: v.n,
        color: "var(--seq-400)",
        detail: `${v.n} istanze`,
      }))
      .sort((a, b) => b.value - a.value);
  }, [report]);

  if (loading) return <div className="page"><LoadingCard height={300} /></div>;
  if (error || !report) return <div className="page"><ErrorState message={error || "Report non trovato"} /></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Rete & Porte</h1>
          <p>Superficie di esposizione di rete per {report.domain_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 16 }}>
        <StatTile label="Asset totali" value={report.n_asset} />
        <StatTile label="Indirizzi IPv4 unici" value={report.unique_ipv4} />
        <StatTile label="Indirizzi IPv6 unici" value={report.unique_ipv6} />
        <StatTile label="Punteggio porte aperte" value={report.open_ports_score} />
      </div>

      <div className="grid grid-cols-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Esposizione per porta</div>
          {portData.length > 0 ? (
            <HorizontalBarChart data={portData} />
          ) : (
            <div className="empty-state">Nessuna porta esposta rilevata.</div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <div className="card-title">Web Application Firewall</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 650 }}>{report.waf.count}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>asset protetti da WAF</div>
              </div>
              <span
                className="status-pill"
                style={{
                  color: report.waf.count > 0 ? "var(--status-good)" : "var(--status-critical)",
                  background: "var(--surface-2)",
                }}
              >
                {report.waf.count > 0 ? "Protezione attiva" : "Nessuna protezione"}
              </span>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Content Delivery Network</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 650 }}>{report.cdn.count}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>asset dietro CDN</div>
              </div>
              <span
                className="status-pill"
                style={{
                  color: report.cdn.count > 0 ? "var(--status-good)" : "var(--status-warning)",
                  background: "var(--surface-2)",
                }}
              >
                {report.cdn.count > 0 ? "CDN in uso" : "Nessuna CDN — rischio DDoS"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
