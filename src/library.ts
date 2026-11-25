import type { LibraryPosition, Side } from "./libraryTypes";
import { POSITIONS } from "./positions";
import { SOURCED } from "./sourced";
import { withSource, type Insight } from "./libraryTypes";

export * from "./libraryTypes";

function sourcedFor(key: string): Insight[] {
  return SOURCED.filter((i) => i.position === key).map((i) => {
    const { source, ...rest } = i;
    return withSource({ ...rest, id: `src:${key}:${SOURCED.indexOf(i)}`, sourceId: source });
  });
}

/** Built-in positions with the practitioner-sourced insights merged in. */
export const LIBRARY: LibraryPosition[] = POSITIONS.map((p) => ({
  ...p,
  insights: [...p.insights, ...sourcedFor(p.key)],
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
