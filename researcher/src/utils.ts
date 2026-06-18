export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function dedupeByUrl<
  T extends { url?: string; imageUrl?: string; sourceUrl?: string },
>(items: T[]): T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    // Prefer the most identity-bearing URL: a source's own `url`, then an
    // image's `imageUrl` (distinct images can share a `sourceUrl` page).
    const key = item.url ?? item.imageUrl ?? item.sourceUrl;
    if (!key) {
      return true;
    }

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
