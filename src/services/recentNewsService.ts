import { getString, setString } from "@nativescript/core/application-settings";
import type { NewsItem } from "./newsService";

const RECENT_KEY = "recentNews";

export function getRecentNews(): NewsItem[] {
  const raw = getString(RECENT_KEY, "[]");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addRecentNews(item: NewsItem, maxItems = 10): NewsItem[] {
  const list = getRecentNews().filter((entry) => entry.id !== item.id);
  list.unshift(item);
  if (list.length > maxItems) {
    list.length = maxItems;
  }
  setString(RECENT_KEY, JSON.stringify(list));
  return list;
}
