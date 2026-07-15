import React, { useState } from "react";

export interface StackSegment {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface StackedBarProps {
  segments: StackSegment[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

const GAP = 2;

export function StackedBar({ segments, height = 28, valueFormatter }: StackedBarProps) {
  const [hover, setHover] = useState<string | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const fmt = valueFormatter ?? ((v: number) => String(v));

  return (
    <div>
      <div style={{ display: "flex", height, borderRadius: 1, overflow: "hidden", background: "var(--surface-2)" }}>
        {segments
          .filter((s) => s.value > 0)
          .map((seg, i, arr) => {
            const pct = (seg.value / total) * 100;
            const isHover = hover === seg.key;
            return (
              <div
                key={seg.key}
                onMouseEnter={() => setHover(seg.key)}
                onMouseLeave={() => setHover((h) => (h === seg.key ? null : h))}
                style={{
                  width: `${pct}%`,
                  background: seg.color,
                  marginRight: i < arr.length - 1 ? GAP : 0,
                  opacity: hover && !isHover ? 0.5 : 1,
                  position: "relative",
                  cursor: "default",
                  transition: "opacity 0.15s ease",
                  minWidth: seg.value > 0 ? 3 : 0,
                }}
                title={`${seg.label}: ${fmt(seg.value)}`}
              />
            );
          })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 12 }}>
        {segments.map((seg) => (
          <div
            key={seg.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              color: hover === seg.key ? "var(--text-primary)" : "var(--text-secondary)",
              cursor: "default",
            }}
            onMouseEnter={() => setHover(seg.key)}
            onMouseLeave={() => setHover((h) => (h === seg.key ? null : h))}
          >
            <span style={{ width: 9, height: 9, borderRadius: 0, background: seg.color, display: "inline-block" }} />
            <span>{seg.label}</span>
            <span className="mono" style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {fmt(seg.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
