import type { GamePlan, Position, Priority, Side, Technique } from "./model";
import { uid } from "./model";
import type { LibraryPosition, LibraryTechnique, Role } from "./libraryTypes";
import { POSITIONS } from "./positions";
import { SOURCED } from "./sourced";

export * from "./libraryTypes";

/** Built-in positions with the practitioner-sourced insights merged in. */
export const LIBRARY: LibraryPosition[] = POSITIONS.map((p) => ({
  ...p,
  insights: [...p.insights, ...SOURCED.filter((i) => i.position === p.key)],
}));

/** Positions techniques can land in that don't have a full write-up yet. */
export const DESTINATIONS: Record<string, { name: string; side: Side }> = {
  "top-half": { name: "Half guard (top)", side: "top" },
  "knee-on-belly": { name: "Knee on belly", side: "top" },
  "top-guard": { name: "Passing (top, in their guard)", side: "top" },
};

/** Plan positions that are the escaping side of a library position. */
export const ESCAPE_ALIASES: Record<string, string> = {
  "side-control-bottom": "side-control-top",
  "mount-bottom": "mount",
  "north-south-bottom": "north-south",
};

export function libraryEntry(key: string | undefined, extra: LibraryPosition[] = []): LibraryPosition | undefined {
  return key ? (LIBRARY.find((l) => l.key === key) ?? extra.find((l) => l.key === key)) : undefined;
}

const known = (k: string) => LIBRARY.some((l) => l.key === k) || k in DESTINATIONS;

/** The library key a plan position corresponds to, if any. */
export function libraryKeyOf(pos: Position): string | undefined {
  if (pos.libraryKey && known(pos.libraryKey)) return pos.libraryKey;
  return known(pos.id) ? pos.id : undefined;
}

/** Which library position and side a plan position maps to, for showing insights. */
export function insightTarget(pos: Position): { key: string; role: Role } | undefined {
  const alias = ESCAPE_ALIASES[pos.libraryKey ?? ""] ?? ESCAPE_ALIASES[pos.id];
  if (alias) return { key: alias, role: "escape" };
  const key = libraryKeyOf(pos);
  return key && LIBRARY.some((l) => l.key === key) ? { key, role: "control" } : undefined;
}

export function findPlanPosition(plan: GamePlan, key: string): Position | undefined {
  return plan.positions.find((p) => libraryKeyOf(p) === key);
}

/** Library techniques this plan doesn't have yet from that position. */
export function missingTechniques(plan: GamePlan, key: string): LibraryTechnique[] {
  const entry = libraryEntry(key);
  const pos = findPlanPosition(plan, key);
  if (!entry) return [];
  if (!pos) return entry.techniques;
  const mine = plan.techniques.filter((t) => t.from === pos.id);
  const names = new Set(mine.map((t) => t.name.trim().toLowerCase()));
  // A transition to the same place is the same move under another name ("Mount from side control" = "Slide to mount").
  const transitionsTo = mine
    .filter((t) => t.type === "transition" && t.to)
    .map((t) => plan.positions.find((p) => p.id === t.to));
  const coveredTransition = (t: LibraryTechnique) =>
    t.type === "transition" && transitionsTo.some((p) => p && libraryKeyOf(p) === t.to);
  return entry.techniques.filter((t) => !names.has(t.name.toLowerCase()) && !coveredTransition(t));
}

/**
 * Add a library position and its techniques to a plan. Creates any landing
 * positions that don't exist yet and skips techniques the plan already has.
 */
export function addFromLibrary(
  plan: GamePlan,
  key: string,
  priority: Priority,
  only?: string[],
): { plan: GamePlan; addedTechniques: number; addedPositions: number } {
  const entry = libraryEntry(key);
  if (!entry) throw new Error(`Unknown library position: ${key}`);

  const positions = [...plan.positions];
  let addedPositions = 0;

  const ensure = (k: string): string => {
    const found = positions.find((p) => libraryKeyOf(p) === k);
    if (found) return found.id;
    const lib = libraryEntry(k);
    const meta = lib ?? DESTINATIONS[k];
    if (!meta) throw new Error(`Unknown destination: ${k}`);
    const id = positions.some((p) => p.id === k) ? uid() : k;
    const name = lib && lib.family === "guard" ? `${lib.name} (bottom)` : meta.name;
    positions.push({ id, name, side: meta.side, notes: "", libraryKey: k });
    addedPositions++;
    return id;
  };

  const fromId = ensure(key);
  const missing = new Set(missingTechniques({ ...plan, positions }, key).map((t) => t.name));
  const toAdd = entry.techniques.filter((t) => missing.has(t.name) && (!only || only.includes(t.name)));

  const techniques: Technique[] = [
    ...plan.techniques,
    ...toAdd.map((t) => ({
      id: uid(),
      name: t.name,
      type: t.type,
      from: fromId,
      to: t.to ? ensure(t.to) : null,
      priority,
      trigger: t.trigger,
      notes: t.notes ?? "",
    })),
  ];

  return {
    plan: { ...plan, positions, techniques, startPosition: plan.startPosition ?? fromId },
    addedTechniques: toAdd.length,
    addedPositions,
  };
}
