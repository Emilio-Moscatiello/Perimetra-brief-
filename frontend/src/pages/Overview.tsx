import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useResource } from "@/hooks/useResource";
import { fetchHistory } from "@/api/client";
import { RiskGauge } from "@/components/RiskGauge";
import { StatTile } from "@/components/StatTile";
import { Meter } from "@/components/Meter";
import { TrendLineChart } from "@/components/TrendLineChart";
import { StackedBar } from "@/components/StackedBar";
import { LoadingCard, ErrorState } from "@/components/LoadingState";
import {
  SEVERITY_LABEL_IT,
  severityColor,
  LEAK_CATEGORY_ORDER,
  LEAK_CATEGORY_LABEL_IT,
  leakCategoryColor,
  formatCompact,
} from "@/lib/colors";
import { Link } from "react-router-dom";

const SCORE_ROWS: { key: keyof import("@/types/report").DomainReport; label: string }[] = [
  { key: "servizi_esposti_score", label: "Servizi esposti" },
  { key: "dataleak_score", label: "Data leak" },
  { key: "vulnerability_score_passive", label: "Vulnerabilità (passive)" },
  { key: "vulnerability_score_active", label: "Vulnerabilità (attive)" },
  { key: "certificate_score", label: "Certificati" },
  { key: "blacklist_score", label: "Blacklist" },
  { key: "rapporto_leak_email_score", label: "Leak email" },
  { key: "spoofing_score", label: "Spoofing" },
  { key: "open_ports_score", label: "Porte aperte" },
];

export function Overview() {
  const { report, loading, error } = useApp();
  const [lang, setLang] = useState<"it" | "en">("it");
  const { data: history, loading: historyLoading } = useResource(
    () => fetchHistory(report?.domain_name || "cybersonar.demo", 90),
    [report?.domain_name]
  );

  if (loading) {
    return (
      <div className="page">
        <div className="grid grid-cols-2" style={{ gap: 16 }}>
          <LoadingCard height={260} />
          <LoadingCard height={260} />
        </div>
      </div>
    );
  }
  if (error || !report) return <div className="page"><ErrorState message={error || "Report non trovato"} /></div>;

  const severityData = (Object.keys(report.n_vulns.total) as (keyof typeof report.n_vulns.total)[]).map((sev) => ({
    key: sev,
    label: SEVERITY_LABEL_IT[sev],
    value: report.n_vulns.total[sev],
    color: severityColor(sev),
  }));

  const leakData = LEAK_CATEGORY_ORDER.map((cat) => ({
    key: cat,
    label: LEAK_CATEGORY_LABEL_IT[cat],
    value: report.n_dataleak.total[cat],
    color: leakCategoryColor(cat),
  }));

  const totalVulns = Object.values(report.n_vulns.total).reduce((a, b) => a + b, 0);
  const totalLeaks = Object.values(report.n_dataleak.total).reduce((a, b) => a + b, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Panoramica — {report.domain_name}</h1>
          <p>
            Report creato il <span className="mono">{report.creation_date}</span> · ultima modifica{" "}
            <span className="mono">{report.last_edit}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ marginBottom: 16, alignItems: "stretch" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RiskGauge score={Number(report.risk_score)} />
        </div>
        <div className="grid grid-cols-2" style={{ gridColumn: "span 2" }}>
          <StatTile label="Asset totali" value={report.n_asset} hint={`${report.unique_ipv4} IPv4 · ${report.unique_ipv6} IPv6 unici`} />
          <StatTile label="Domini simili rilevati" value={report.n_similar_domains} hint="Possibile typosquatting" />
          <StatTile label="Certificati attivi / scaduti" value={`${report.n_cert_attivi} / ${report.n_cert_scaduti}`} />
          <StatTile
            label="Vulnerabilità totali"
            value={formatCompact(totalVulns)}
            hint={`${report.n_vulns.total.critical} critiche`}
            accent={report.n_vulns.total.critical > 0 ? "var(--status-critical)" : undefined}
          />
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 16, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Andamento del rischio (90 giorni)</div>
          {historyLoading || !history ? (
            <LoadingCard height={220} />
          ) : (
            <TrendLineChart points={history} />
          )}
        </div>
        <div className="card">
          <div className="card-title">Punteggi per categoria di rischio</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SCORE_ROWS.map((row) => (
              <Meter key={row.key} label={row.label} value={report[row.key] as number} />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 16, alignItems: "start" }}>
        <div className="card">
          <div className="card-title">Vulnerabilità per gravità</div>
          <StackedBar segments={severityData} />
          <Link to="/vulnerabilita" style={{ display: "inline-block", marginTop: 14, fontSize: 12.5, fontWeight: 600, color: "var(--series-1)" }}>
            Vedi il dettaglio delle vulnerabilità →
          </Link>
        </div>
        <div className="card">
          <div className="card-title">Data leak per categoria ({formatCompact(totalLeaks)} totali)</div>
          <StackedBar segments={leakData} />
          <Link to="/data-leak" style={{ display: "inline-block", marginTop: 14, fontSize: 12.5, fontWeight: 600, color: "var(--series-1)" }}>
            Vedi il dettaglio dei data leak →
          </Link>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="card-title" style={{ margin: 0 }}>
            Riepilogo esecutivo
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={`chip`} data-active={lang === "it"} onClick={() => setLang("it")}>
              IT
            </button>
            <button className={`chip`} data-active={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
        </div>
        <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
          {(lang === "it" ? report.summary_text : report.summary_text_en).replace(/\*\*/g, "")}
        </div>
      </div>
    </div>
  );
}
