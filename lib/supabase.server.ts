import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "./env.server";

let cached: SupabaseClient | undefined;

/** Cliente con la secret key (bypassa RLS). null si falta la configuración. */
export function getSupabase(): SupabaseClient | null {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: key } =
    getEnv();
  if (url === undefined || key === undefined) return null;
  cached ??= createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export function isScraperConfigured(): boolean {
  return getSupabase() !== null;
}
