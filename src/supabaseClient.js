import { createClient } from "@supabase/supabase-js";

// Use environment variables if available, otherwise fallback to hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://sasxikqbiaftooyarqtg.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3hpa3FiaWFmdG9veWFycXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODc3NTIsImV4cCI6MjA3MjM2Mzc1Mn0.Lak8FElt0--t2klOaLM-4YSfxiRxWs5agIPDIvPrFBs";

if (!supabaseAnonKey) {
  console.warn("Supabase key is missing");
}

// Create a single Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
