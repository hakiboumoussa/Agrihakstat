// Ces deux valeurs sont substituées à la compilation (esbuild `define`, voir scripts/build.mjs) à
// partir des variables d'environnement de build SUPABASE_URL / SUPABASE_ANON_KEY — à définir dans
// Vercel → Settings → Environment Variables pour un déploiement réel, plutôt que codées en dur ici.
// Cela permet notamment de faire pointer un environnement de prévisualisation (preview/staging)
// vers un projet Supabase distinct du projet de production, sans modifier ni recommitter le code.
//
// L'anon key reste par ailleurs publique par conception : elle peut sans risque figurer dans le
// code envoyé au navigateur, à condition que les règles RLS (Row Level Security) soient activées
// côté Supabase — voir supabase_setup.sql fourni à la racine du projet. Le déplacement vers des
// variables de build est donc une question d'hygiène de configuration (permettre plusieurs
// environnements, éviter de recommiter une clé pour la faire tourner) et non une faille corrigée.
//
// process.env.SUPABASE_URL / process.env.SUPABASE_ANON_KEY n'existent qu'après substitution par
// esbuild (scripts/build.mjs) ; en dehors de ce pipeline de build (ex. un outil qui importerait ce
// fichier sans passer par esbuild), ils se comportent comme des chaînes vides.
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
