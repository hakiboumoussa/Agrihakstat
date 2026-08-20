import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, BarChart3, FileText, Settings, Sprout,
  Bell, ChevronDown, Upload, FileSpreadsheet, FileCheck2, Link2, MapPin,
  Plus, Check, ChevronRight, ChevronLeft, X, AlertCircle, Trash2,
} from "lucide-react";
import UserMenu from "./UserMenu.jsx";
import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

const FILIERES = {
  Soja:   "#3E9C6B",
  Maïs:   "#F0AC1B",
  Riz:    "#3592C4",
  Manioc: "#B5651D",
  Coton:  "#6C7DAE",
};

const COMMUNES = ["Bembéréké", "Kalalé", "Nikki", "N'Dali", "Parakou", "Pérèrè", "Sinendé", "Tchaourou"];

const nav = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "import", label: "Assistant d'import", icon: ClipboardList },
  { id: "config", label: "Configuration des analyses", icon: BarChart3 },
  { id: "results", label: "Résultats & rapport", icon: FileText },
  { id: "map", label: "Cartographie", icon: MapPin },
];

const STEPS = [
  { id: 1, label: "Questionnaire" },
  { id: 2, label: "Base de données" },
  { id: 3, label: "Contexte de l'étude" },
  { id: 4, label: "Indicateurs" },
  { id: 5, label: "Cartographie des variables" },
];

function Watermark() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 flex items-center justify-center">
      <span className="font-serif font-black whitespace-nowrap select-none"
        style={{ color: NAVY, opacity: 0.06, fontSize: "13vw", letterSpacing: "-0.02em" }}>
        AgriHakStat
      </span>
      <span className="absolute bottom-4 right-6 text-xs font-medium select-none"
        style={{ color: NAVY, opacity: 0.35 }}>
        Conçu par Hakibou MOUSSA
      </span>
    </div>
  );
}

function Stepper({ current, setCurrent }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.id}>
          <button onClick={() => setCurrent(s.id)} className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0"
              style={
                s.id < current
                  ? { background: "#3E9C6B", color: "white" }
                  : s.id === current
                  ? { background: NAVY, color: "white" }
                  : { background: "#EDEEF3", color: "#8A93A8" }
              }
            >
              {s.id < current ? <Check size={14} /> : s.id}
            </div>
            <span
              className="text-xs font-medium hidden md:block"
              style={{ color: s.id === current ? NAVY : "#8A93A8" }}
            >
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-[2px] mx-3" style={{ background: s.id < current ? "#3E9C6B" : "#E4E6ED" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-black/5 ${className}`}>
      {children}
    </div>
  );
}

function Dropzone({ label, hint, formats }) {
  return (
    <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-colors hover:bg-[#FAFBFE]"
      style={{ borderColor: "#C7D2E8" }}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1" style={{ background: "#EBEEF7" }}>
        <Upload size={20} style={{ color: NAVY }} />
      </div>
      <div className="font-medium text-sm" style={{ color: NAVY }}>{label}</div>
      <div className="text-xs text-gray-400">{hint}</div>
      <div className="flex flex-wrap gap-1.5 justify-center mt-2">
        {formats.map((f) => (
          <span key={f} className="text-[10px] px-2 py-1 rounded-full bg-[#F6E9DD] text-[#8A4A1D] font-medium">{f}</span>
        ))}
      </div>
    </div>
  );
}

function UploadedFile({ icon: Icon, name, meta, tint, fg }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-3 border border-black/5" style={{ background: tint }}>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "white" }}>
        <Icon size={18} style={{ color: fg }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: fg }}>{name}</div>
        <div className="text-[11px] opacity-70" style={{ color: fg }}>{meta}</div>
      </div>
      <button className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
    </div>
  );
}

function Chip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
      style={
        active
          ? { background: color || NAVY, borderColor: color || NAVY, color: "white" }
          : { background: "white", borderColor: "#D8DEE9", color: "#5A6478" }
      }
    >
      {label}
    </button>
  );
}

export default function ImportWizard({ active, onNavigate, userEmail, userId, roleLabel, isAdmin, isGuest, onLogout, onOpenAdmin }) {
  const [step, setStep] = useState(1);
  const [communes, setCommunes] = useState(["Tchaourou", "Pérèrè"]);
  const [filieres, setFilieres] = useState(["Coton"]);
  const [objectif, setObjectif] = useState(
    "Suivre la progression décadaire des semis de coton sur les communes à risque pluviométrique du Borgou."
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <Watermark />
      <div className="relative z-10 flex">
        {/* Sidebar */}
        <aside className="w-60 min-h-screen shrink-0 py-6 px-4 text-[#C7D2E8]"
          style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #16294B 100%)` }}>
          <div className="flex flex-col items-start gap-1 px-2 mb-8">
            <img src="./logo-compact.png" alt="AgriHakStat" className="h-32 w-auto -ml-1" />
            <div className="text-[10px] opacity-60">DDAEP-Borgou</div>
          </div>
          <nav className="space-y-1.5">
            {nav.map((item) => (
              <div key={item.id} onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-colors ${
                  item.id === active ? "bg-[#16294B] text-white font-medium border-l-4" : "hover:bg-white/5"
                }`}
                style={item.id === active ? { borderColor: GOLD } : {}}>
                <item.icon size={17} />
                {item.label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 min-h-screen">
          <header className="bg-white/70 backdrop-blur px-8 py-4 flex items-center justify-between"
            style={{ borderBottom: `2px solid ${GOLD}` }}>
            <div>
              <h1 className="font-serif text-xl font-bold" style={{ color: NAVY }}>Nouvelle enquête</h1>
              <p className="text-xs text-gray-500 mt-0.5">Assistant d'import — questionnaire, base et contexte d'étude</p>
            </div>
            <div className="flex items-center gap-4">
              <Bell size={18} className="text-gray-400" />
              <UserMenu email={userEmail} roleLabel={roleLabel} isAdmin={isAdmin} isGuest={isGuest}
                onLogout={onLogout} onOpenAdmin={onOpenAdmin} />
            </div>
          </header>

          <main className="p-8 max-w-4xl">
            <Stepper current={step} setCurrent={setStep} />

            {/* STEP 1 — Questionnaire */}
            {step === 1 && (
              <Card>
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Importer le questionnaire</h2>
                <p className="text-xs text-gray-400 mb-5">Formats reconnus automatiquement : XLSForm/KoboToolbox, Akvo Flow, ODK, ou fichier Excel de structure libre.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Dropzone label="Glisser-déposer un fichier" hint="ou cliquer pour parcourir" formats={["XLSForm", "ODK", ".xlsx"]} />
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#FAFBFE]" style={{ borderColor: "#C7D2E8" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1" style={{ background: "#E4F5EC" }}>
                      <Link2 size={20} style={{ color: "#256B45" }} />
                    </div>
                    <div className="font-medium text-sm" style={{ color: NAVY }}>Connecter Akvo Flow / KoboToolbox</div>
                    <div className="text-xs text-gray-400">Import direct via API</div>
                  </div>
                </div>
                <div className="mt-5">
                  <UploadedFile icon={FileSpreadsheet} name="Questionnaire_Suivi_Semis_2026-2027.xlsx" meta="24 questions détectées · importé il y a 2 min" tint="#EBEEF7" fg={NAVY} />
                </div>
              </Card>
            )}

            {/* STEP 2 — Base de données */}
            {step === 2 && (
              <Card>
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Importer la base de données</h2>
                <p className="text-xs text-gray-400 mb-5">Fichier CSV/Excel, ou connexion directe à la source de collecte.</p>
                <div className="grid grid-cols-2 gap-4">
                  <Dropzone label="Glisser-déposer un fichier" hint="ou cliquer pour parcourir" formats={["CSV", ".xlsx"]} />
                  <div className="border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-[#FAFBFE]" style={{ borderColor: "#C7D2E8" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-1" style={{ background: "#E4F5EC" }}>
                      <Link2 size={20} style={{ color: "#256B45" }} />
                    </div>
                    <div className="font-medium text-sm" style={{ color: NAVY }}>Connecter Akvo Flow / KoboToolbox</div>
                    <div className="text-xs text-gray-400">Synchronisation automatique</div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  <UploadedFile icon={FileCheck2} name="Base_Semis_Decade3_Juillet2026.csv" meta="2 479 enregistrements · 31 colonnes" tint="#E4F5EC" fg="#256B45" />
                  <div className="flex items-start gap-2 rounded-xl p-3 border border-black/5" style={{ background: "#FDF1DA" }}>
                    <MapPin size={16} style={{ color: "#8A5A00" }} className="mt-0.5" />
                    <div className="text-xs" style={{ color: "#8A5A00" }}>
                      <span className="font-medium">5 colonnes de géolocalisation détectées</span> (latitude, longitude) — la cartographie automatique (Module 8) sera disponible pour cette enquête.
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 3 — Contexte de l'étude */}
            {step === 3 && (
              <Card>
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Contexte de l'étude</h2>
                <p className="text-xs text-gray-400 mb-5">Ces informations cadrent l'interprétation narrative du rapport final.</p>

                <label className="text-xs font-medium text-gray-600 block mb-1.5">Objectif de l'étude</label>
                <textarea
                  className="w-full text-sm rounded-xl border border-gray-200 p-3 mb-5 resize-none focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": GOLD }}
                  rows={2}
                  value={objectif}
                  onChange={(e) => setObjectif(e.target.value)}
                />

                <label className="text-xs font-medium text-gray-600 block mb-1.5">Zone géographique (communes)</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {COMMUNES.map((c) => (
                    <Chip key={c} label={c} active={communes.includes(c)} onClick={() => toggle(communes, setCommunes, c)} />
                  ))}
                </div>

                <label className="text-xs font-medium text-gray-600 block mb-1.5">Filière(s) concernée(s)</label>
                <div className="flex flex-wrap gap-2 mb-5">
                  {Object.entries(FILIERES).map(([f, c]) => (
                    <Chip key={f} label={f} active={filieres.includes(f)} onClick={() => toggle(filieres, setFilieres, f)} color={c} />
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Période de référence</label>
                    <div className="flex items-center gap-2">
                      <input type="text" defaultValue="10/06/2026" className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
                      <span className="text-gray-400 text-xs">→</span>
                      <input type="text" defaultValue="20/07/2026" className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Unité d'analyse</label>
                    <select className="w-full text-sm rounded-xl border border-gray-200 p-2.5 focus:outline-none focus:ring-2" style={{ "--tw-ring-color": GOLD }}>
                      <option>Exploitation agricole</option>
                      <option>Ménage</option>
                      <option>Parcelle</option>
                      <option>Commune</option>
                    </select>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 4 — Indicateurs */}
            {step === 4 && (
              <Card>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-serif font-semibold" style={{ color: NAVY }}>Indicateurs de performance</h2>
                  <button className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white" style={{ background: NAVY }}>
                    <Plus size={14} /> Ajouter un indicateur
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-5">Ces indicateurs seront mis en regard des analyses bivariées et de l'enrichissement climatique (Module 7).</p>

                <div className="space-y-3">
                  {[
                    { name: "Taux de réalisation des semis", formule: "Superficie réalisée / Superficie prévue × 100", seuil: "75 %" },
                    { name: "Rendement moyen estimé", formule: "Production estimée / Superficie réalisée", seuil: "ND — à renseigner" },
                  ].map((kpi) => (
                    <div key={kpi.name} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#EBEEF7" }}>
                        <BarChart3 size={15} style={{ color: NAVY }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{kpi.name}</div>
                        <div className="text-[11px] text-gray-400">{kpi.formule}</div>
                      </div>
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: "#FDF1DA", color: "#8A5A00" }}>
                        Seuil : {kpi.seuil}
                      </span>
                      <button className="text-gray-300 hover:text-red-400"><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* STEP 5 — Cartographie des variables */}
            {step === 5 && (
              <Card>
                <h2 className="font-serif font-semibold mb-1" style={{ color: NAVY }}>Cartographie automatique des variables</h2>
                <p className="text-xs text-gray-400 mb-5">Appariement proposé entre les items du questionnaire et les colonnes de la base — à valider avant lancement des analyses.</p>

                <div className="rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase bg-gray-50">
                        <th className="px-4 py-2.5 font-medium">Item du questionnaire</th>
                        <th className="px-4 py-2.5 font-medium">Colonne base</th>
                        <th className="px-4 py-2.5 font-medium">Type détecté</th>
                        <th className="px-4 py-2.5 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { q: "Superficie semée (ha)", col: "sup_semee_ha", type: "Quantitative continue", status: "ok" },
                        { q: "Filière suivie", col: "filiere", type: "Nominale", status: "ok" },
                        { q: "Commune d'enquête", col: "commune", type: "Nominale", status: "ok" },
                        { q: "Latitude / Longitude", col: "geo_lat / geo_lon", type: "Géolocalisation", status: "geo" },
                        { q: "Niveau de satisfaction intrants", col: "satisf_intrants", type: "Ordinale", status: "warn" },
                      ].map((r) => (
                        <tr key={r.q} className="border-t border-gray-50">
                          <td className="px-4 py-3 text-gray-800">{r.q}</td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">{r.col}</td>
                          <td className="px-4 py-3 text-gray-500">{r.type}</td>
                          <td className="px-4 py-3">
                            {r.status === "ok" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: "#E4F5EC", color: "#256B45" }}>
                                <Check size={11} /> Confirmé
                              </span>
                            )}
                            {r.status === "geo" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: "#EBEEF7", color: NAVY }}>
                                <MapPin size={11} /> Géo détectée
                              </span>
                            )}
                            {r.status === "warn" && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full" style={{ background: "#FDF1DA", color: "#8A5A00" }}>
                                <AlertCircle size={11} /> À vérifier
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 disabled:opacity-0 bg-white border border-gray-200 text-gray-600"
              >
                <ChevronLeft size={15} /> Précédent
              </button>
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}
                >
                  Suivant <ChevronRight size={15} />
                </button>
              ) : submitted ? (
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#256B45" }}>
                  <Check size={16} /> Projet soumis — visible dans le tableau de bord administrateur
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (isGuest || !isSupabaseConfigured) {
                      setSubmitError("Créez un compte pour soumettre un projet réel (mode démonstration : rien n'est enregistré).");
                      return;
                    }
                    setSubmitting(true);
                    setSubmitError("");
                    const { error } = await supabase.from("projets").insert({
                      user_id: userId,
                      user_email: userEmail,
                      titre: objectif,
                      thematiques: filieres,
                      communes: communes,
                      statut: "soumis",
                    });
                    setSubmitting(false);
                    if (error) setSubmitError(error.message);
                    else setSubmitted(true);
                  }}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 text-white shadow-md disabled:opacity-60"
                  style={{ background: `linear-gradient(135deg, #3E9C6B, #256B45)` }}
                >
                  <Check size={15} /> {submitting ? "Envoi en cours…" : "Lancer les analyses"}
                </button>
              )}
            </div>
            {submitError && (
              <p className="text-xs mt-3 text-right" style={{ color: "#B3413A" }}>{submitError}</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
