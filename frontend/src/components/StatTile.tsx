import React from "react";

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: string;
  icon?: React.ReactNode;
}

export function StatTile({ label, value, hint, accent, icon }: StatTileProps) {
  return (
    <div className="card stat-tile" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="stat-tile-label">{label}</span>
        {icon && (
          <span style={{ color: accent || "var(--text-muted)", display: "flex" }} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <span className="stat-tile-value"
        style={{
          color: accent || "var(--text-primary)",
        }}
      >
        {value}
      </span>
      {hint && <span className="stat-tile-hint">{hint}</span>}
    </div>
  );
}
