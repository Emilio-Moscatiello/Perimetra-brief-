import React from "react";
import { useApp } from "@/context/AppContext";
import { StatTile } from "@/components/StatTile";
import { StackedBar } from "@/components/StackedBar";
import { LoadingCard, ErrorState } from "@/components/LoadingState";

export function CertsEmail() {
  const { report, loading, error } = useApp();

  if (loading) return <div className="page"><LoadingCard height={300} /></div>;
  if (error || !report) return <div className="page"><ErrorState message={error || "Report non trovato"} /></div>;

  const spoofable = report.email_security.spoofable.toLowerCase().includes("possible");
  const dmarc = report.email_security.dmarc_policy;
  const dmarcOk = dmarc === "reject";

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Certificati & Sicurezza Email</h1>
          <p>Stato dei certificati TLS e della protezione anti-spoofing per {report.domain_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 16, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Certificati SSL/TLS</div>
          <StackedBar
            segments={[
              { key: "attivi", label: "Attivi", value: report.n_cert_attivi, color: "var(--status-good)" },
              { key: "scaduti", label: "Scaduti", value: report.n_cert_scaduti, color: "var(--status-critical)" },
            ]}
          />
          <div style={{ marginTop: 14, fontSize: 12.5, color: "var(--text-muted)" }}>
            Punteggio certificati: <strong style={{ color: "var(--text-primary)" }}>{report.certificate_score}</strong>/100
          </div>
        </div>

        <div className="card">
          <div className="card-title">Blacklist</div>
          <div className="grid grid-cols-2">
            <StatTile label="Rilevazioni" value={report.email_security.blacklist_detections} accent={report.email_security.blacklist_detections > 0 ? "var(--status-critical)" : "var(--status-good)"} />
            <StatTile label="Liste monitorate" value={report.email_security.blacklist_total_list} />
          </div>
          {report.email_security.blacklist_detected_list.length > 0 ? (
            <ul style={{ marginTop: 12, paddingLeft: 18, fontSize: 13 }}>
              {report.email_security.blacklist_detected_list.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--text-muted)" }}>Nessuna presenza in blacklist rilevata.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ alignItems: "stretch" }}>
        <div className="card">
          <div className="card-title">Anti-spoofing (DMARC / SPF)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              className="status-pill"
              style={{ color: spoofable ? "var(--status-critical)" : "var(--status-good)", background: "var(--surface-2)" }}
            >
              {spoofable ? "Spoofing possibile" : "Non spoofabile"}
            </span>
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Politica DMARC configurata:</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["none", "quarantine", "reject"].map((p) => (
                <span
                  key={p}
                  className="chip"
                  data-active={p === dmarc}
                  style={{ color: p === dmarc ? (dmarcOk ? "var(--status-good)" : "var(--status-warning)") : undefined }}
                >
                  {p}
                </span>
              ))}
            </div>
            {!dmarcOk && (
              <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
                Consigliato: passare a <strong>reject</strong> per bloccare completamente le email contraffatte.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-title">Punteggio rapporto leak email</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 700 }}>{report.rapporto_leak_email_score}</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/ 100</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Combina esposizione a data leak con credenziali email associate al dominio e qualità della configurazione anti-spoofing.
          </p>
        </div>
      </div>
    </div>
  );
}
