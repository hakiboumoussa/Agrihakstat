import React from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, MapPin, Settings,
} from "lucide-react";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar({ active, onNavigate, children }) {
  return (
    <aside className="w-60 min-h-screen shrink-0 py-6 px-4 text-[#C7D2E8] flex flex-col"
      style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #16294B 100%)` }}>
      <div className="flex flex-col items-start gap-1 px-2 mb-8">
        <img src="./logo-compact.png" alt="AgriHakStat" className="h-32 w-auto -ml-1" />
        <div className="text-[10px] opacity-60">DDAEP-Borgou</div>
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
              item.id === active
                ? "bg-[#16294B] text-white font-medium shadow-inner border-l-4"
                : "hover:bg-white/5"
            }`}
            style={item.id === active ? { borderColor: GOLD } : {}}
          >
            <item.icon size={17} />
            {item.label}
          </div>
        ))}
      </nav>

      {children}
    </aside>
  );
}
