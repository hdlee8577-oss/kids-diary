(function () {
  const missingConfigMessage =
    "Supabase is not configured. Update supabase-config.js with your project URL and anon key.";

  window.getSupabaseClient = function () {
    if (window.supabaseClient) {
      return window.supabaseClient;
    }

    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.warn(missingConfigMessage);
      return null;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      console.warn("Supabase library failed to load.");
      return null;
    }

    window.supabaseClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false
        }
      }
    );
    return window.supabaseClient;
  };
})();
