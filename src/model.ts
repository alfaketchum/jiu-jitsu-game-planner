export type Side = "top" | "bottom" | "neutral";
export type TechType = "takedown" | "pass" | "sweep" | "submission" | "transition" | "escape";
export type Priority = "A" | "B" | "learning";

export interface Position {
  id: string;
  name: string;
  side: Side;
  notes: string;
}

export interface Technique {
  id: string;
  name: string;
  type: TechType;
  from: string; // position id
  to: string | null; // resulting position id; null for submissions (fight over)
  priority: Priority;
  /** The reaction or opening that tells me to use this: "when they post the hand…" */
  trigger: string;
  notes: string;
}

export interface GamePlan {
  id: string;
  name: string;
  ruleset: string;
  startPosition: string | null;
  positions: Position[];
  techniques: Technique[];
  updatedAt: number;
}

export const TECH_TYPES: TechType[] = ["takedown", "pass", "sweep", "submission", "transition", "escape"];
export const PRIORITIES: Priority[] = ["A", "B", "learning"];
export const SIDES: Side[] = ["neutral", "top", "bottom"];

export const PRIORITY_LABEL: Record<Priority, string> = {
  A: "A-game",
  B: "B-game",
  learning: "Learning",
};

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function outgoing(plan: GamePlan, positionId: string): Technique[] {
  return plan.techniques.filter((t) => t.from === positionId);
}

export function incoming(plan: GamePlan, positionId: string): Technique[] {
  return plan.techniques.filter((t) => t.to === positionId && t.from !== positionId);
}

export interface ChainNode {
  technique: Technique;
  children: ChainNode[];
  /** True when the destination was already visited on this path, so we stop. */
  loops: boolean;
}

/**
 * Every path out of a position, depth-first, stopping at submissions,
 * dead ends, repeated positions and the depth limit.
 */
export function buildChains(
  plan: GamePlan,
  fromId: string,
  opts: { maxDepth?: number; priorities?: Priority[] } = {},
): ChainNode[] {
  const maxDepth = opts.maxDepth ?? 5;
  const allowed = new Set(opts.priorities ?? PRIORITIES);

  const walk = (posId: string, depth: number, seen: Set<string>): ChainNode[] => {
    if (depth >= maxDepth) return [];
    return outgoing(plan, posId)
      .filter((t) => allowed.has(t.priority))
      .map((t) => {
        if (!t.to || t.type === "submission") return { technique: t, children: [], loops: false };
        if (seen.has(t.to)) return { technique: t, children: [], loops: true };
        const next = new Set(seen).add(t.to);
        return { technique: t, children: walk(t.to, depth + 1, next), loops: false };
      });
  };

  return walk(fromId, 0, new Set([fromId]));
}

export type GapKind = "dead-end" | "no-escape" | "no-finish" | "unreachable" | "thin";

export interface Gap {
  kind: GapKind;
  positionId: string;
  message: string;
}

/** Positions from which some submission can be reached using the given techniques. */
function positionsThatCanFinish(plan: GamePlan): Set<string> {
  const finish = new Set<string>();
  for (const t of plan.techniques) if (t.type === "submission") finish.add(t.from);
  let changed = true;
  while (changed) {
    changed = false;
    for (const t of plan.techniques) {
      if (t.to && finish.has(t.to) && !finish.has(t.from)) {
        finish.add(t.from);
        changed = true;
      }
    }
  }
  return finish;
}

function reachableFrom(plan: GamePlan, start: string): Set<string> {
  const seen = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const t of outgoing(plan, cur)) {
      if (t.to && !seen.has(t.to)) {
        seen.add(t.to);
        queue.push(t.to);
      }
    }
  }
  return seen;
}

/** Holes in the plan: the stuff a training partner will find before you do. */
export function findGaps(plan: GamePlan): Gap[] {
  const gaps: Gap[] = [];
  const canFinish = positionsThatCanFinish(plan);
  const reachable = plan.startPosition ? reachableFrom(plan, plan.startPosition) : null;

  for (const p of plan.positions) {
    const out = outgoing(plan, p.id);
    if (out.length === 0) {
      gaps.push({ kind: "dead-end", positionId: p.id, message: `No techniques from ${p.name}. What do you do when you land here?` });
      continue;
    }
    if (p.side === "bottom" && !out.some((t) => t.type === "escape" || t.type === "sweep")) {
      gaps.push({ kind: "no-escape", positionId: p.id, message: `Stuck on bottom in ${p.name}: no sweep or escape.` });
    }
    if (!canFinish.has(p.id)) {
      gaps.push({ kind: "no-finish", positionId: p.id, message: `No path to a submission from ${p.name}.` });
    }
    if (out.length === 1) {
      gaps.push({ kind: "thin", positionId: p.id, message: `Only one option from ${p.name}. Add a backup for when it's shut down.` });
    }
    if (reachable && !reachable.has(p.id)) {
      gaps.push({ kind: "unreachable", positionId: p.id, message: `${p.name} isn't reachable from your starting position.` });
    }
  }
  return gaps;
}

export function validatePlan(data: unknown): GamePlan {
  const d = data as Partial<GamePlan>;
  if (!d || typeof d !== "object") throw new Error("Not a game plan file.");
  if (typeof d.name !== "string" || !Array.isArray(d.positions) || !Array.isArray(d.techniques)) {
    throw new Error("Game plan is missing name, positions or techniques.");
  }
  const ids = new Set(d.positions.map((p) => p.id));
  for (const t of d.techniques) {
    if (!ids.has(t.from) || (t.to !== null && !ids.has(t.to))) {
      throw new Error(`Technique "${t.name}" points at a position that doesn't exist.`);
    }
  }
  return {
    id: typeof d.id === "string" ? d.id : uid(),
    name: d.name,
    ruleset: d.ruleset ?? "",
    startPosition: d.startPosition && ids.has(d.startPosition) ? d.startPosition : null,
    positions: d.positions,
    techniques: d.techniques,
    updatedAt: Date.now(),
  };
}
