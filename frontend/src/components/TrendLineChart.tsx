import React, { useMemo, useRef, useState } from "react";
import type { HistoryPoint } from "@/types/report";

interface TrendLineChartProps {
  points: HistoryPoint[];
  width?: number;
  height?: number;
  color?: string;
}

const MARGIN = { top: 16, right: 16, bottom: 26, left: 34 };

export function TrendLineChart({ points, height = 220, color = "var(--series-1)" }: TrendLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const width = containerWidth;
  const plotW = Math.max(10, width - MARGIN.left - MARGIN.right);
  const plotH = Math.max(10, height - MARGIN.top - MARGIN.bottom);

  const { path, areaPath, xFor, yFor, yTicks } = useMemo(() => {
    const n = points.length;
    const xFor = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * plotW);
    const yFor = (v: number) => plotH - (v / 100) * plotH;
    const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(1)} ${yFor(p.risk_score).toFixed(1)}`).join(" ");
    const area = `${d} L ${xFor(n - 1).toFixed(1)} ${plotH} L ${xFor(0).toFixed(1)} ${plotH} Z`;
    const yTicks = [0, 25, 50, 75, 100];
    return { path: d, areaPath: area, xFor, yFor, yTicks };
  }, [points, plotW, plotH]);

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const n = points.length;
    if (n === 0) return;
    const idx = Math.round((x / plotW) * (n - 1));
    setHoverIdx(Math.max(0, Math.min(n - 1, idx)));
  };

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <svg width={width} height={height} role="img" aria-label="Andamento del punteggio di rischio nel tempo">
        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={0} x2={plotW} y1={yFor(t)} y2={yFor(t)} stroke="var(--grid-line)" strokeWidth={1} />
              <text x={-10} y={yFor(t)} dy={4} textAnchor="end" fontSize={11} fill="var(--text-muted)">
                {t}
              </text>
            </g>
          ))}
          <path d={areaPath} fill={color} opacity={0.1} stroke="none" />
          <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hoverIdx !== null && (
            <line
              x1={xFor(hoverIdx)}
              x2={xFor(hoverIdx)}
              y1={0}
              y2={plotH}
              stroke="var(--baseline)"
              strokeWidth={1}
            />
          )}
          {hoverIdx !== null && hoverPoint && (
            <circle
              cx={xFor(hoverIdx)}
              cy={yFor(hoverPoint.risk_score)}
              r={5}
              fill={color}
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          )}

          <rect
            x={0}
            y={0}
            width={plotW}
            height={plotH}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIdx(null)}
          />
        </g>
      </svg>
      {hoverIdx !== null && hoverPoint && (
        <div
          style={{
            position: "absolute",
            left: Math.min(Math.max(MARGIN.left + xFor(hoverIdx) - 55, 0), width - 120),
            top: 6,
            background: "var(--text-primary)",
            color: "var(--surface-1)",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 12,
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontWeight: 700 }}>{hoverPoint.risk_score}</div>
          <div style={{ opacity: 0.8 }}>{hoverPoint.date}</div>
        </div>
      )}
    </div>
  );
}
