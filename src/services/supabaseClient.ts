import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://agfhiflzcsmkmydiyrxv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_tjBaY67MSnYKzN63VhWaYA_CTOscz5Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
