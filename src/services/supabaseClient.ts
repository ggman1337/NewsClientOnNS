import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jhgipwlkllokoqccnbdu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_SDyuzVAeSX4ARyjehx5T6Q_qYzFVziy";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
