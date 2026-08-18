# AgriHakStat — Démonstration interactive

Maquette React regroupant les cinq écrans conçus pour le SaaS AgriHakStat :
tableau de bord, assistant d'import, configuration des analyses, résultats & rapport,
et cartographie.

## Structure du projet

```
agrihakstat_demo/
├── src/
│   ├── App.jsx              # Barre de navigation + bascule entre les 5 écrans
│   ├── entry.jsx            # Point d'entrée React (ReactDOM.render)
│   ├── Dashboard.jsx        # Écran 1 — Tableau de bord
│   ├── ImportWizard.jsx     # Écran 2 — Assistant d'import
│   ├── AnalysisConfig.jsx   # Écran 3 — Configuration des analyses
│   ├── ResultsReport.jsx    # Écran 4 — Résultats & rapport
│   └── Cartographie.jsx     # Écran 5 — Cartographie
├── dist/                    # Fichiers compilés (générés, ne pas éditer à la main)
│   ├── bundle.js
│   └── styles.css
├── index.html                # Page racine à ouvrir dans le navigateur
├── input.css                  # Point d'entrée Tailwind (@tailwind base/components/utilities)
├── tailwind.config.js
└── package.json
```

## Installation (première utilisation)

Dans le terminal intégré de VS Code, à la racine du projet :

```bash
npm install
```

## Développement

Pour reconstruire une fois après une modification :

```bash
npm run build
```

Pour recompiler automatiquement à chaque enregistrement (deux terminaux VS Code séparés) :

```bash
npm run watch:js
```
```bash
npm run watch:css
```

## Aperçu dans le navigateur

Ouvrez simplement `index.html` dans un navigateur (double-clic, ou extension
**Live Server** de VS Code pour un rechargement automatique). Aucun serveur
n'est requis pour la consultation ; `npm run serve` reste disponible si vous
préférez un petit serveur local.

## Modifier un écran

Chaque écran est un composant React autonome dans `src/`. Éditez le fichier
correspondant, relancez `npm run build` (ou laissez `watch:js`/`watch:css`
actifs), puis rafraîchissez `index.html`.

## Conçu par

Hakibou MOUSSA — Ingénieur Agronome, Spécialiste en Biostatistique & Modélisation
