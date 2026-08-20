import React from "react";
import { Sprout, BarChart3, MapPin, FileText, ArrowRight } from "lucide-react";

const NAVY = "#1F3864";
const GOLD = "#C99A2E";

export default function Landing({ onGoLogin, onGoSignup, onGoDemo }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6FB] via-[#FAF7F0] to-[#F1F7F3] font-sans">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <img src="./logo-compact.png" alt="AgriHakStat" className="h-20 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onGoLogin} className="px-4 py-2 rounded-xl text-sm font-medium" style={{ color: NAVY }}>
            Se connecter
          </button>
          <button onClick={onGoSignup} className="px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
            Créer un compte
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 pt-16 pb-24 text-center">
        <h1 className="font-serif text-4xl font-bold leading-tight" style={{ color: NAVY }}>
          L'analyse statistique de vos enquêtes agricoles,<br />automatisée et rigoureuse
        </h1>
        <p className="text-gray-500 mt-5 text-lg max-w-2xl mx-auto">
          Importez votre questionnaire et votre base de données, laissez AgriHakStat proposer les tests
          statistiques adaptés, et générez un rapport structuré, cartographié et prêt à diffuser.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button onClick={onGoSignup} className="px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #2A4A82)` }}>
            Créer un compte gratuitement <ArrowRight size={16} />
          </button>
          <button onClick={onGoLogin} className="px-6 py-3 rounded-xl text-sm font-semibold border"
            style={{ borderColor: NAVY, color: NAVY }}>
            J'ai déjà un compte
          </button>
        </div>
        <button onClick={onGoDemo} className="text-sm underline mt-4 inline-block" style={{ color: "#8A93A8" }}>
          Voir la démonstration sans créer de compte
        </button>

        <div className="grid grid-cols-3 gap-6 mt-20 text-left">
          {[
            { icon: BarChart3, title: "Tests statistiques guidés", text: "Sélection automatique des tests univariés, bivariés et multivariés, validée par vos soins avant exécution." },
            { icon: MapPin, title: "Cartographie intégrée", text: "Localisation des enquêtes, choroplèthes par commune et couches climatiques NASA POWER." },
            { icon: FileText, title: "Rapport structuré", text: "Un document en huit sections, annexes statistiques consolidées automatiquement." },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-black/5">
              <f.icon size={22} style={{ color: GOLD }} />
              <h3 className="font-serif font-semibold mt-3 mb-1" style={{ color: NAVY }}>{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 pb-8">
        AgriHakStat — Conçu par Hakibou Moussa
      </footer>
    </div>
  );
}
