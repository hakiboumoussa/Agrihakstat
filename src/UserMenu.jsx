import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, ShieldCheck, Sparkles } from "lucide-react";

const NAVY = "#1F3864";

export default function UserMenu({ email, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const initials = isGuest ? "?" : (email || "").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
          style={{ background: NAVY }}>{initials}</div>
        <div className="leading-tight text-left">
          <div className="font-medium text-gray-800 max-w-[140px] truncate">{isGuest ? "Mode démonstration" : email}</div>
          <div className="text-[11px] text-gray-500">{roleLabel}</div>
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
          {isAdmin && (
            <button onClick={() => { setOpen(false); onOpenAdmin(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50" style={{ color: NAVY }}>
              <ShieldCheck size={14} /> Panneau d'administration
            </button>
          )}
          {isGuest ? (
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-gray-50" style={{ color: NAVY }}>
              <Sparkles size={14} /> Créer un compte
            </button>
          ) : (
            <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-red-500 hover:bg-gray-50">
              <LogOut size={14} /> Se déconnecter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
