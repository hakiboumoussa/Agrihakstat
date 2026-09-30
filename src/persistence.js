// Persistance Supabase de l'état de travail en cours (base importée, file d'analyses bivariées et
// univariées, contexte d'étude — qui inclut le rapport généré par Claude, cf. ResultsReport.jsx qui
// l'y range via onContextChange). Une ligne par utilisateur (public.work_sessions, mise à jour par
// upsert) — voir supabase_migration_persistence.sql pour le schéma et le choix de conception.
//
// Complète, sans le remplacer, le localStorage déjà utilisé par App.jsx : le localStorage protège
// contre une fermeture d'onglet accidentelle sur le même appareil ; cette couche permet de
// retrouver son travail depuis un autre appareil, après une déconnexion, ou si les données du site
// sont effacées localement. Aucune fonction ici n'est bloquante pour l'interface : un échec (hors
// ligne, RLS non configurée si la migration n'a pas été exécutée, etc.) est journalisé en
// avertissement et n'interrompt jamais le travail en cours — la session localStorage reste le
// filet de sécurité immédiat dans tous les cas.

import { supabase, isSupabaseConfigured } from "./supabaseClient.js";

// Charge la session de travail sauvegardée pour cet utilisateur, ou null si aucune, si Supabase
// n'est pas configuré, ou en cas d'erreur (RLS/migration absente, réseau...).
export async function loadWorkSession(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  try {
    const { data, error } = await supabase
      .from("work_sessions")
      .select("dataset, analysis_queue, univariate_queue, context, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.warn("Reprise de la session de travail Supabase impossible :", error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn("Reprise de la session de travail Supabase impossible :", e.message);
    return null;
  }
}

// Enregistre (upsert) l'état de travail actuel. Appelée avec un léger anti-rebond côté appelant
// (cf. App.jsx) pour éviter un upsert à chaque frappe/changement d'état.
export async function saveWorkSession(userId, { dataset, analysisQueue, univariateQueue, context }) {
  if (!isSupabaseConfigured || !userId) return;
  try {
    const { error } = await supabase.from("work_sessions").upsert({
      user_id: userId,
      dataset: dataset || null,
      analysis_queue: analysisQueue || [],
      univariate_queue: univariateQueue || [],
      context: context || null,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn("Enregistrement de la session de travail Supabase impossible :", error.message);
  } catch (e) {
    console.warn("Enregistrement de la session de travail Supabase impossible :", e.message);
  }
}

// Supprime la session de travail sauvegardée (ex. à la déconnexion explicite, si l'utilisateur
// souhaite repartir de zéro) — best-effort, jamais bloquant.
export async function clearWorkSession(userId) {
  if (!isSupabaseConfigured || !userId) return;
  try {
    const { error } = await supabase.from("work_sessions").delete().eq("user_id", userId);
    if (error) console.warn("Suppression de la session de travail Supabase impossible :", error.message);
  } catch (e) {
    console.warn("Suppression de la session de travail Supabase impossible :", e.message);
  }
}
