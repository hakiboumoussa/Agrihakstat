import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const isSupabaseConfigured =
  SUPABASE_URL !== "https://VOTRE-PROJET.supabase.co" && SUPABASE_ANON_KEY !== "VOTRE_CLE_ANON_PUBLIQUE";

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
