import { createClient } from "@supabase/supabase-js";

// Retrieve optional Supabase configurations from Vite environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Log status on development
if (!isSupabaseConfigured) {
  console.log(
    "Supabase credentials not found. Falling back to robust offline LocalStorage engine."
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * SQL Schema for creation in Supabase console:
 * 
 * create table fuel_entries (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   date date not null,
 *   cost numeric not null
 * );
 * 
 * -- Enable Realtime if desired:
 * alter publish realtime add table fuel_entries;
 */
