import React, { useState } from "react";

export interface BarDatum {
  label: string;
  value: number;
  color: string;
  detail?: string;
}

interface HorizontalBarChartProps {
  data: BarDatum[];
  maxValue?: number;
  valueFormatter?: (v: number) => string;
}

const BAR_THICKNESS = 20;
const GAP = 10;
const LABEL_WIDTH = 150;

export function HorizontalBarChart({ data, maxValue, valueFormatter }: HorizontalBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = maxValue ?? Math.max(1, ...data.map((d) => d.value));
  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: GAP }}>
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          const isHover = hover === i;
          return (
            <div
              key={d.label}
              style={{ display: "grid", gridTemplateColumns: `${LABEL_WIDTH}px 1fr 56px`, alignItems: "center", gap: 12 }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover((h) => (h === i ? null : h))}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={d.label}
              >
                {d.label}
              </span>
              <div
                style={{
                  position: "relative",
                  height: BAR_THICKNESS,
                  background: "var(--surface-2)",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${pct}%`,
                    background: d.color,
                    borderRadius: 1,
                    opacity: isHover ? 1 : 0.92,
                    boxShadow: isHover ? `0 0 0 2px var(--surface-1), 0 0 0 3px ${d.color}` : "none",
                    transition: "width 0.4s ease, opacity 0.15s ease",
                  }}
                />
                {isHover && d.detail && (
                  <div
                    style={{
                      position: "absolute",
                      left: `min(${pct}%, 100%)`,
                      top: -34,
                      transform: "translateX(-50%)",
                      background: "var(--text-primary)",
                      color: "var(--surface-1)",
                      fontSize: 11.5,
                      padding: "4px 8px",
                      borderRadius: 6,
                      whiteSpace: "nowrap",
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                  >
                    {d.detail}
                  </div>
                )}
              </div>
              <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                {fmt(d.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
