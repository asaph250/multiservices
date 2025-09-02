import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://sasxikqbiaftooyarqtg.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNhc3hpa3FiaWFmdG9veWFycXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3ODc3NTIsImV4cCI6MjA3MjM2Mzc1Mn0.Lak8FElt0--t2klOaLM-4YSfxiRxWs5agIPDIvPrFBs"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
