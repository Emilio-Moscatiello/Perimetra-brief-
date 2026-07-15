import React from "react";
import { useApp } from "@/context/AppContext";
import { scoreToStatus, STATUS_LABEL_IT, STATUS_VAR } from "@/lib/colors";

export function TopBar() {
  const { domains, selectedDomain, setSelectedDomain, report, theme, toggleTheme } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-group">
        <label className="topbar-label" htmlFor="domain-select">
          Dominio
        </label>
        <select
          id="domain-select"
          className="select"
          value={selectedDomain}
          onChange={(e) => setSelectedDomain(e.target.value)}
        >
          {domains.map((d) => (
            <option key={d.domain_name} value={d.domain_name}>
              {d.domain_name}
            </option>
          ))}
        </select>
        {report && (
          <span
            className="status-pill"
            style={{
              color: STATUS_VAR[scoreToStatus(Number(report.risk_score))],
              background: "var(--surface-2)",
            }}
          >
            Rischio {report.risk_score} · {STATUS_LABEL_IT[scoreToStatus(Number(report.risk_score))]}
          </span>
        )}
      </div>
      <div className="topbar-group">
        {report && (
          <span className="topbar-updated">
            Aggiornato: <span className="mono">{report.last_edit}</span>
          </span>
        )}
        <button
          onClick={toggleTheme}
          aria-label="Cambia tema"
          className="select"
          style={{ cursor: "pointer" }}
        >
          {theme === "light" ? "🌙 Scuro" : "☀️ Chiaro"}
        </button>
      </div>
    </header>
  );
}
