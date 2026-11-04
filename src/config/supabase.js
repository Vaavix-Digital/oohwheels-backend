require("dotenv").config();

let supabaseClient = null;

/**
 * Get or initialize Supabase client.
 * Returns null if SUPABASE_URL / SUPABASE_ANON_KEY are not yet configured.
 */
function getSupabase() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (err) {
    console.warn("⚠️ @supabase/supabase-js package not installed yet. Run `npm i @supabase/supabase-js` to enable direct Supabase queries.");
    return null;
  }
}

module.exports = {
  getSupabase,
  isSupabaseConfigured: () => Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)),
};
