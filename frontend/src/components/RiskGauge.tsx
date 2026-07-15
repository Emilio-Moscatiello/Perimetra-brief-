import React from "react";
import { scoreToStatus, STATUS_LABEL_IT, STATUS_VAR } from "@/lib/colors";

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export function RiskGauge({ score, size = 200 }: RiskGaugeProps) {
  const status = scoreToStatus(score);
  const color = STATUS_VAR[status];
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const filled = (score / 100) * arcLength;
  const rotation = 135;

  return (
    <div className="risk-gauge" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Punteggio di rischio: ${score} su 100`}>
        <g transform={`rotate(${rotation} ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={10}
            strokeLinecap="square"
            strokeDasharray={`${arcLength} ${circumference}`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="square"
            strokeDasharray={`${filled} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </g>
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size * 0.24}
          fontWeight={700}
          fill="var(--text-primary)"
        >
          {score}
        </text>
        <text x="50%" y="64%" textAnchor="middle" fontSize={size * 0.07} fill="var(--text-muted)">
          su 100
        </text>
      </svg>
      <span
        className="status-pill"
        style={{ color, background: "var(--surface-2)" }}
      >
        {STATUS_LABEL_IT[status]}
      </span>
    </div>
  );
}
