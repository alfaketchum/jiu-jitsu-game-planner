import type { LibraryPosition } from "./libraryTypes";
import changelog from "./data/changelog.json";

/** One update to one position. The latest entry's hash must match the position's current content. */
export interface ChangeEntry {
  version: number;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  /** Ids from src/sources.ts used in this update. */
  sources: string[];
  /** Fingerprint of the position's content after this update. */
  hash?: string;
  /** Reconstructed from git history rather than logged at the time. */
  backfilled?: boolean;
}

export const CHANGELOG = changelog as Record<string, ChangeEntry[]>;

export function historyOf(key: string): ChangeEntry[] {
  return CHANGELOG[key] ?? [];
}

export function latestOf(key: string): ChangeEntry | undefined {
  const h = historyOf(key);
  return h[h.length - 1];
}

/** 32-bit FNV-1a, hex. Small and stable; only used to detect changes. */
function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Fingerprint of everything a reader sees for a position: text, insights, sources, techniques. */
export function positionHash(p: LibraryPosition): string {
  const content = {
    name: p.name,
    aka: p.aka ?? [],
    summary: p.summary,
    rules: p.rules ?? "",
    gi: p.gi ?? "",
    parent: p.parent ?? "",
    related: p.related,
    controller: p.controller,
    escaper: p.escaper,
    insights: p.insights.map((i) => [i.role, i.topic, i.text, i.sourceId ?? "", i.at ?? "", i.gi ?? ""]),
    techniques: p.techniques.map((t) => [
      t.name,
      t.type,
      t.to ?? "",
      t.trigger,
      t.gi ?? "",
      t.from ?? "",
      (t.insights ?? []).map((i) => [i.role, i.topic, i.text, i.sourceId ?? "", i.at ?? "", i.gi ?? ""]),
    ]),
  };
  return fnv1a(JSON.stringify(content));
}
