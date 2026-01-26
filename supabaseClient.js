import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const placeholderUrl = "https://your-project.supabase.co";
const placeholderKey = "your-anon-key";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    SUPABASE_URL !== placeholderUrl &&
    SUPABASE_ANON_KEY !== placeholderKey &&
    !SUPABASE_URL.includes("your-project") &&
    !SUPABASE_ANON_KEY.includes("your-anon-key")
);

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
