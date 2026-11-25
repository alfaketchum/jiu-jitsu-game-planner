import {
  LIBRARY,
  ROLES_BY_FAMILY,
  GROUPS,
  TOPICS,
  visibleIn,
  type Attire,
  type AttireMode,
  type Family,
  type Group,
  type Insight,
  type LibraryPosition,
  type Role,
  type Topic,
} from "./library";
import type { Side } from "./model";

/** Everything the user adds to the library: their own insights and positions. */
export interface Notebook {
  insights: Insight[];
  positions: LibraryPosition[];
}

const KEY = "jjgp.notebook.v1";

/** Names used by earlier versions, so saved notes keep working. */
const LEGACY_TOPICS: Record<string, Topic> = { "off-balance": "kuzushi" };
const LEGACY_GROUPS: Record<string, Group> = {
  "Closed & half guard": "Half guard",
  "Spider & lasso family": "Spider & lasso",
  "Seated guards": "Seated & butterfly",
  "Top pins": "Pins",
};

export const emptyNotebook = (): Notebook => ({ insights: [], positions: [] });

export function loadNotebook(): Notebook {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return validateNotebook(JSON.parse(raw));
  } catch {
    /* fall through */
  }
  return emptyNotebook();
}

export function saveNotebook(n: Notebook): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(n));
  } catch {
    /* private mode or quota */
  }
}

export function validateNotebook(data: unknown): Notebook {
  const d = data as Partial<Notebook>;
  if (!d || !Array.isArray(d.insights) || !Array.isArray(d.positions)) throw new Error("Not a library notes file.");
  const insights = d.insights.filter(
    (i): i is Insight =>
      !!i && typeof i.text === "string" && typeof i.position === "string" && (i.role === "control" || i.role === "escape"),
  ).map((i) => ({ ...i, topic: LEGACY_TOPICS[i.topic] ?? (TOPICS.includes(i.topic) ? i.topic : "key idea"), user: true }));
  const positions = d.positions
    .filter((p): p is LibraryPosition => !!p && typeof p.key === "string" && typeof p.name === "string")
    .map((p) => {
      const family: Family = (p.family as string) === "top" ? "pin" : p.family in ROLES_BY_FAMILY ? p.family : "guard";
      const group = LEGACY_GROUPS[p.group] ?? (GROUPS.includes(p.group) ? p.group : "Other");
      return { ...p, family, group, ...ROLES_BY_FAMILY[family], insights: [], techniques: [], related: p.related ?? [], user: true };
    });
  return { insights, positions };
}

/** Built-in positions plus the user's own. */
export function allPositions(n: Notebook): LibraryPosition[] {
  return [...LIBRARY, ...n.positions];
}

/** Built-in plus user insights for one position and side, filtered for gi / no-gi. */
export function insightsFor(n: Notebook, key: string, role: Role, mode: AttireMode = "both"): Insight[] {
  const builtIn = LIBRARY.find((l) => l.key === key)?.insights ?? [];
  return [...builtIn, ...n.insights.filter((i) => i.position === key)].filter(
    (i) => i.role === role && visibleIn(mode, i.gi),
  );
}

/** Every named source across the library, most-cited first. */
export function sources(n: Notebook): { name: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const i of [...LIBRARY.flatMap((l) => l.insights), ...n.insights]) {
    if (i.source) counts.set(i.source, (counts.get(i.source) ?? 0) + 1);
  }
  return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function addInsight(
  n: Notebook,
  i: { position: string; role: Role; topic: Topic; text: string; source?: string; gi?: Attire },
): Notebook {
  const text = i.text.trim();
  if (!text) return n;
  const source = i.source?.trim() || undefined;
  const id = `user:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const { gi, source: _rawSource, ...rest } = i;
  return { ...n, insights: [...n.insights, { ...rest, text, ...(source ? { source } : {}), ...(gi ? { gi } : {}), id, user: true }] };
}

export function removeInsight(n: Notebook, id: string): Notebook {
  return { ...n, insights: n.insights.filter((i) => i.id !== id) };
}

export function addPosition(
  n: Notebook,
  p: { name: string; group: Group; family: Family; side: Side; gi?: Attire; parent?: string; summary: string },
): { notebook: Notebook; key: string } {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "position";
  const taken = new Set(allPositions(n).map((x) => x.key));
  let key = `user-${slug}`;
  for (let i = 2; taken.has(key); i++) key = `user-${slug}-${i}`;
  const pos: LibraryPosition = {
    key,
    name: p.name.trim(),
    side: p.side,
    family: p.family,
    group: p.group,
    ...(p.gi ? { gi: p.gi } : {}),
    ...(p.parent ? { parent: p.parent } : {}),
    summary: p.summary.trim(),
    ...ROLES_BY_FAMILY[p.family],
    related: [],
    insights: [],
    techniques: [],
    user: true,
  };
  return { notebook: { ...n, positions: [...n.positions, pos] }, key };
}

export function removePosition(n: Notebook, key: string): Notebook {
  return {
    positions: n.positions.filter((p) => p.key !== key).map((p) => (p.parent === key ? { ...p, parent: undefined } : p)),
    insights: n.insights.filter((i) => i.position !== key),
  };
}
