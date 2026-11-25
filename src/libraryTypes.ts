import { sourceById } from "./sources";

export type Side = "top" | "bottom" | "neutral";
export type TechType = "takedown" | "pass" | "sweep" | "submission" | "transition" | "escape";

/**
 * Every position has two sides:
 *  - control: what the person holding the position does (attacking side)
 *  - escape:  what the person stuck in it does (defending side)
 * For a guard, control belongs to the guard player and escapes to the passer.
 * For a pin, control belongs to the top player and escapes to the bottom player.
 * For a leg entanglement, control belongs to the attacker and escapes to the person whose leg is trapped.
 */
export type Role = "control" | "escape";

export type Topic = "key idea" | "grips" | "body position" | "pressure" | "distance" | "kuzushi" | "mistake";
export const TOPICS: Topic[] = ["key idea", "grips", "body position", "pressure", "distance", "kuzushi", "mistake"];
export const TOPIC_LABEL: Record<Topic, string> = {
  "key idea": "Key idea",
  grips: "Grips",
  "body position": "Body position",
  pressure: "Pressure",
  distance: "Distance",
  kuzushi: "Kuzushi (off-balancing)",
  mistake: "Mistakes",
};

/** "gi" = gi only, "no-gi" = no-gi only, undefined = both. */
export type Attire = "gi" | "no-gi";
export type AttireMode = "both" | Attire;

export function visibleIn(mode: AttireMode, attire: Attire | undefined): boolean {
  return mode === "both" || !attire || attire === mode;
}

export interface Insight {
  id: string;
  position: string; // library key
  role: Role;
  topic: Topic;
  text: string;
  /** Practitioner it comes from (display name). Empty = common coaching. */
  source?: string;
  /** Id in src/sources.ts. Built-in named insights always have one. */
  sourceId?: string;
  /** Video timestamp in seconds, when the source is a video. */
  at?: number;
  /** "pending" when the attribution hasn't been checked against a source yet. */
  sourceStatus?: "verified" | "pending";
  /** Where the source says it (instructional page, interview, video). */
  url?: string;
  /** How we know: e.g. "BJJMore review" when it's a write-up of their course rather than their own words. */
  via?: string;
  gi?: Attire;
  /** Added by the user rather than built in. */
  user?: boolean;
}

export type SourceKind = "course" | "review" | "article" | "video" | "video write-up" | "book" | "unverified";

export interface Source {
  id: string;
  practitioner: string;
  title: string;
  publisher: string;
  url?: string;
  kind: SourceKind;
  /** Short label shown next to an insight, e.g. "BJJMore course review". */
  via: string;
  /** Date the source was read (YYYY-MM-DD). */
  accessed: string;
  status: "verified" | "pending";
}

/** Fill an insight's display fields (name, link, label) from its source id. */
export function withSource<T extends { sourceId?: string; at?: number }>(i: T): T & Pick<Insight, "source" | "url" | "via" | "sourceStatus"> {
  if (!i.sourceId) return i;
  const s = sourceById(i.sourceId);
  if (!s) throw new Error(`Unknown source id: ${i.sourceId}`);
  const url = s.url && i.at != null ? `${s.url}${s.url.includes("?") ? "&" : "?"}t=${i.at}s` : s.url;
  return { ...i, source: s.practitioner, ...(url ? { url } : {}), via: s.via, sourceStatus: s.status };
}

export interface LibraryTechnique {
  name: string;
  type: TechType;
  /** Library key of the position it lands in; null for submissions. */
  to: string | null;
  trigger: string;
  gi?: Attire;
  notes?: string;
  /** "bottom" for a technique the escaping player does (e.g. the buggy choke from bottom side control). */
  from?: "bottom";
  /** Sourced insights about this technique from this position: control = doing it, escape = defending it. */
  insights?: Insight[];
}

export type Group =
  | "Closed guard"
  | "Half guard"
  | "Spider & lasso"
  | "De La Riva"
  | "Seated & butterfly"
  | "X-guards"
  | "Leg entanglements"
  | "Pins"
  | "Back"
  | "Turtle"
  | "Open guard"
  | "Other";

export const GROUPS: Group[] = [
  "Open guard",
  "Closed guard",
  "Half guard",
  "Spider & lasso",
  "De La Riva",
  "Seated & butterfly",
  "X-guards",
  "Leg entanglements",
  "Pins",
  "Back",
  "Turtle",
  "Other",
];

export type Family = "guard" | "pin" | "back" | "legs";

export interface LibraryPosition {
  key: string;
  name: string;
  /** Other names: common nicknames, Danaher's terms, judo names. */
  aka?: string[];
  /** Side of the person in control. Guards are controlled from the bottom. */
  side: Side;
  family: Family;
  group: Group;
  /** Key of the position this is a variation of (a sub-guard). */
  parent?: string;
  gi?: Attire;
  summary: string;
  /** Rules worth knowing before using it (e.g. leg-lock restrictions). */
  rules?: string;
  /** Who is in control / who is escaping, in plain words. */
  controller: string;
  escaper: string;
  related: string[];
  insights: Insight[];
  techniques: LibraryTechnique[];
  user?: boolean;
}

export const ROLES_BY_FAMILY: Record<Family, { controller: string; escaper: string }> = {
  guard: { controller: "Guard player (bottom)", escaper: "Passer (top)" },
  pin: { controller: "Top player", escaper: "Bottom player" },
  back: { controller: "Player on the back", escaper: "Player defending" },
  legs: { controller: "Attacker", escaper: "Person whose leg is trapped" },
};

type Line = [Topic, string, string?, Attire?];

export type Draft = Omit<LibraryPosition, "insights" | "controller" | "escaper" | "related" | "techniques"> & {
  controller?: string;
  escaper?: string;
  related?: string[];
  techniques?: LibraryTechnique[];
  control: Line[];
  escapes: Line[];
};

export function build(d: Draft): LibraryPosition {
  const { control, escapes, ...rest } = d;
  // The third element of a line is a source id from src/sources.ts.
  const mk = (role: Role) => ([topic, text, sourceId, gi]: Line, i: number): Insight =>
    withSource({
      id: `${d.key}:${role}:${i}`,
      position: d.key,
      role,
      topic,
      text,
      ...(sourceId ? { sourceId } : {}),
      ...(gi ? { gi } : {}),
    });
  return {
    ...ROLES_BY_FAMILY[d.family],
    related: [],
    techniques: [],
    ...rest,
    insights: [...control.map(mk("control")), ...escapes.map(mk("escape"))],
  };
}
