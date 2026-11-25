import type { Side, TechType } from "./model";

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
  /** Practitioner or instructional it comes from. Empty = common coaching. */
  source?: string;
  /** Where the source says it (instructional page, interview, video). */
  url?: string;
  /** How we know: e.g. "BJJMore review" when it's a write-up of their course rather than their own words. */
  via?: string;
  gi?: Attire;
  /** Added by the user rather than built in. */
  user?: boolean;
}

export interface LibraryTechnique {
  name: string;
  type: TechType;
  /** Library key of the position it lands in; null for submissions. */
  to: string | null;
  trigger: string;
  gi?: Attire;
  notes?: string;
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
  const mk = (role: Role) => ([topic, text, source, gi]: Line, i: number): Insight => ({
    id: `${d.key}:${role}:${i}`,
    position: d.key,
    role,
    topic,
    text,
    ...(source ? { source } : {}),
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
