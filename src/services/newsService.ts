import { supabase } from "./supabaseClient";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tag: string;
  img_url: string | null;
  published_at: string;
  created_at: string;
}

export async function fetchNews(): Promise<NewsItem[]> {
  const { data, error } = await supabase
    .from("news")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data ?? []) as NewsItem[];
}
