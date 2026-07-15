import React from "react";
import { scoreToStatus, STATUS_VAR } from "@/lib/colors";

interface MeterProps {
  label: string;
  value: number;
  max?: number;
  tooltip?: string;
}

export function Meter({ label, value, max = 100, tooltip }: MeterProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const status = scoreToStatus(value);
  const color = STATUS_VAR[status];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 44px", alignItems: "center", gap: 12 }} title={tooltip}>
      <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{label}</span>
      <div
        style={{
          position: "relative",
          height: 8,
          borderRadius: 0,
          background: "var(--surface-2)",
          overflow: "hidden",
        }}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${pct}%`,
            background: color,
            borderRadius: 0,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        className="mono"
        style={{ fontSize: 13, fontWeight: 700, color, textAlign: "right" }}
      >
        {value}
      </span>
    </div>
  );
}
