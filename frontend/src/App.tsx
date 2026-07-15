import React from "react";
import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { Overview } from "@/pages/Overview";
import { Vulnerabilities } from "@/pages/Vulnerabilities";
import { DataLeaks } from "@/pages/DataLeaks";
import { Network } from "@/pages/Network";
import { CertsEmail } from "@/pages/CertsEmail";
import { SimilarDomains } from "@/pages/SimilarDomains";

export function App() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <TopBar />
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/vulnerabilita" element={<Vulnerabilities />} />
          <Route path="/data-leak" element={<DataLeaks />} />
          <Route path="/rete" element={<Network />} />
          <Route path="/certificati-email" element={<CertsEmail />} />
          <Route path="/domini-simili" element={<SimilarDomains />} />
        </Routes>
      </div>
    </div>
  );
}
