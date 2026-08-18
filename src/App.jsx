import React, { useState } from "react";
import Dashboard from "./Dashboard.jsx";
import ImportWizard from "./ImportWizard.jsx";
import AnalysisConfig from "./AnalysisConfig.jsx";
import ResultsReport from "./ResultsReport.jsx";
import Cartographie from "./Cartographie.jsx";

const SCREENS = [
  { id: "dashboard", label: "Tableau de bord", Component: Dashboard },
  { id: "import", label: "Assistant d'import", Component: ImportWizard },
  { id: "config", label: "Configuration des analyses", Component: AnalysisConfig },
  { id: "results", label: "Résultats & rapport", Component: ResultsReport },
  { id: "map", label: "Cartographie", Component: Cartographie },
];

export default function App() {
  const [active, setActive] = useState("dashboard");
  const Active = SCREENS.find((s) => s.id === active).Component;

  return (
    <div>
      <div className="sticky top-0 z-50 flex items-center gap-1 px-3 py-2 bg-[#0F1B33] shadow-md overflow-x-auto">
        <span className="text-white/50 text-[11px] font-medium uppercase tracking-wide mr-2 shrink-0">
          Démonstration AgriHakStat —
        </span>
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0"
            style={
              active === s.id
                ? { background: "#C99A2E", color: "#1F3864" }
                : { background: "transparent", color: "rgba(255,255,255,0.65)" }
            }
          >
            {s.label}
          </button>
        ))}
      </div>
      <Active />
    </div>
  );
}
