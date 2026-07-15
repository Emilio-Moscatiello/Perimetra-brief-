import React from "react";
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "Panoramica", end: true },
  { to: "/vulnerabilita", label: "Vulnerabilità" },
  { to: "/data-leak", label: "Data Leak" },
  { to: "/rete", label: "Rete & Porte" },
  { to: "/certificati-email", label: "Certificati & Email" },
  { to: "/domini-simili", label: "Domini simili" },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="var(--accent-bright)" strokeWidth="1" opacity=".45" />
            <circle cx="12" cy="12" r="4.5" stroke="var(--accent-bright)" strokeWidth="1" opacity=".7" />
            <path d="M12 12 18.5 7.5" stroke="var(--accent-bright)" strokeWidth="1.4" strokeLinecap="square" />
            <circle cx="12" cy="12" r="1.5" fill="var(--accent-bright)" />
          </svg>
        </span>
        <span className="brand-name">Perimetra</span>
      </div>
      <nav className="sidebar-nav" aria-label="Navigazione principale">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
