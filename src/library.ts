import type { LibraryPosition, Side } from "./libraryTypes";
import { POSITIONS } from "./positions";
import { SOURCED } from "./sourced";
import { withSource, type Insight } from "./libraryTypes";

export * from "./libraryTypes";

function resolve(i: (typeof SOURCED)[number]): Insight {
  const { source, technique: _technique, ...rest } = i;
  return withSource({ ...rest, id: `src:${i.position}:${SOURCED.indexOf(i)}`, sourceId: source });
}

/** Practitioner insights about the position itself. */
function sourcedFor(key: string): Insight[] {
  return SOURCED.filter((i) => i.position === key && !i.technique).map(resolve);
}

/** Practitioner insights about one technique on one position (variant-specific). */
function techniqueInsights(key: string, name: string): Insight[] {
  return SOURCED.filter((i) => i.position === key && i.technique === name).map(resolve);
}

/** Built-in positions with the practitioner-sourced insights merged in. */
export const LIBRARY: LibraryPosition[] = POSITIONS.map((p) => ({
  ...p,
  insights: [...p.insights, ...sourcedFor(p.key)],
  techniques: p.techniques.map((t) => {
    const insights = techniqueInsights(p.key, t.name);
    return insights.length ? { ...t, insights } : t;
  }),
}));

/** Positions techniques can land in that don't have a full write-up yet. */
export const DESTINATIONS: Record<string, { name: string; side: Side }> = {
  "top-half": { name: "Half guard (top)", side: "top" },
  "knee-on-belly": { name: "Knee on belly", side: "top" },
  "top-guard": { name: "Passing (top, in their guard)", side: "top" },
};

export function libraryEntry(key: string | undefined): LibraryPosition | undefined {
  return key ? LIBRARY.find((l) => l.key === key) : undefined;
}

/** "Kimura from half guard" and "Kimura" are the same technique: strip the "from …" part. */
export function techniqueFamily(name: string): string {
  return name.replace(/\s+from\s+.*$/i, "").trim().toLowerCase();
}

/** Other positions that have a variant of the same technique, e.g. kimura from side control and north-south. */
export function techniqueVariants(positionKey: string, name: string): LibraryPosition[] {
  const family = techniqueFamily(name);
  return LIBRARY.filter((p) => p.key !== positionKey && p.techniques.some((t) => techniqueFamily(t.name) === family));
}
