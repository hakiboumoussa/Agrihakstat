// Script de build unique (remplace les appels esbuild en ligne de commande dans package.json) :
// utilise l'API JS d'esbuild plutôt que le CLI pour pouvoir injecter proprement, via `define`, les
// identifiants Supabase lus depuis les variables d'environnement de build (SUPABASE_URL,
// SUPABASE_ANON_KEY — configurées dans Vercel → Settings → Environment Variables pour un
// déploiement réel), sans les échappements shell fragiles qu'exigerait la même chose en ligne de
// commande. En l'absence de ces variables (build local/démo), les valeurs par défaut du projet de
// démonstration sont utilisées, pour ne rien casser tant qu'elles ne sont pas configurées côté Vercel.
import { build, context } from "esbuild";
import { rm } from "node:fs/promises";

const watchMode = process.argv.includes("--watch");

const DEFAULT_SUPABASE_URL = "https://eiskklrphzuuzczvnrbr.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_oRS5BanjPWL7lp5_6Cz3_g_MRQBGQiq";

const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    "[build] SUPABASE_URL / SUPABASE_ANON_KEY non définies dans l'environnement — utilisation des valeurs par défaut du projet de démonstration. " +
    "Pour un déploiement réel, définissez-les dans Vercel → Settings → Environment Variables."
  );
}

const define = {
  "process.env.SUPABASE_URL": JSON.stringify(supabaseUrl),
  "process.env.SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
};

const appBuildOptions = {
  entryPoints: ["src/entry.jsx"],
  bundle: true,
  splitting: true,
  format: "esm",
  outdir: "public",
  chunkNames: "chunks/[name]-[hash]",
  entryNames: "bundle",
  loader: { ".js": "jsx" },
  define,
};

const workerBuildOptions = {
  entryPoints: ["src/importWorker.js"],
  bundle: true,
  outfile: "public/importWorker.js",
  format: "iife",
};

async function main() {
  await rm("public/chunks", { recursive: true, force: true });

  if (watchMode) {
    const appCtx = await context(appBuildOptions);
    const workerCtx = await context(workerBuildOptions);
    await Promise.all([appCtx.watch(), workerCtx.watch()]);
    console.log("[build] Mode watch actif (bundle.js + fragments par route + importWorker.js).");
    return;
  }

  await build(appBuildOptions);
  await build(workerBuildOptions);
  console.log("[build] JS terminé (bundle.js + fragments par route + importWorker.js).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
