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
├── public/                   # Dossier publié par Vercel
│   ├── index.html             # Page racine (suivie par Git)
│   ├── bundle.js               # Généré par npm run build (non suivi par Git)
│   └── styles.css               # Généré par npm run build (non suivi par Git)
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

Après `npm run build`, ouvrez `public/index.html` dans un navigateur (double-clic,
ou extension **Live Server** de VS Code pour un rechargement automatique).
`npm run serve` lance aussi un petit serveur local sur le dossier `public/`.

## Modifier un écran

Chaque écran est un composant React autonome dans `src/`. Éditez le fichier
correspondant, relancez `npm run build` (ou laissez `watch:js`/`watch:css`
actifs), puis rafraîchissez `public/index.html`.

## Déploiement (GitHub → Vercel)

1. `git add . && git commit -m "..." && git push`
2. Sur vercel.com, importez le dépôt GitHub — Vercel détecte automatiquement
   le dossier `public/` comme dossier de sortie, aucune configuration
   supplémentaire n'est nécessaire.
3. Chaque nouveau `git push` déclenche un redéploiement automatique.

## Authentification et panneau admin (Supabase)

Le site inclut désormais une page d'accueil publique, un système de compte
(inscription / connexion) et un panneau d'administration, connectés à
**Supabase** (service gratuit d'authentification + base de données).

### Mise en place (une seule fois)

1. Créez un compte gratuit sur **https://supabase.com** → **New project**
2. Une fois le projet créé, allez dans **Project Settings → API** et notez
   deux valeurs : **Project URL** et **anon public key**
3. Ouvrez `src/config.js` dans ce projet et remplacez les deux valeurs
   d'exemple par les vôtres
4. Dans Supabase, ouvrez **SQL Editor → New query**, collez le contenu du
   fichier `supabase_setup.sql` fourni à la racine de ce projet, puis **Run**
5. Dans Supabase, **Authentication → Providers**, vérifiez que **Email** est
   activé (c'est le cas par défaut)
6. `npm run build`, puis `git add . && git commit -m "Connexion Supabase" && git push`
   — Vercel redéploiera automatiquement

### Vous désigner comme administrateur

1. Créez votre compte depuis le site déployé (bouton **Créer un compte**)
2. Confirmez votre adresse e-mail (lien reçu par courriel)
3. Dans Supabase → **SQL Editor**, exécutez :
   ```sql
   update public.profiles set role = 'admin' where email = 'votre-email@exemple.com';
   ```
4. Reconnectez-vous sur le site : un bouton **Admin** apparaît désormais en
   haut à droite, donnant accès au nombre d'utilisateurs inscrits et à la
   fréquentation par écran.

### Tant que Supabase n'est pas configuré

Le site reste pleinement consultable via le bouton **Voir la démonstration
sans créer de compte** sur la page d'accueil. Les boutons de connexion et
d'inscription, eux, affichent un message explicite plutôt que d'échouer
silencieusement tant que les clés Supabase ne sont pas renseignées.

## Conçu par

Hakibou MOUSSA — Ingénieur Agronome, Spécialiste en Biostatistique & Modélisation
