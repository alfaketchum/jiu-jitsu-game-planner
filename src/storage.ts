import type { GamePlan } from "./model";
import { validatePlan } from "./model";
import { samplePlan } from "./sample";

const KEY = "jjgp.plans.v1";
const ACTIVE = "jjgp.active.v1";

export function loadPlans(): GamePlan[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed.map(validatePlan);
    }
  } catch {
    // Corrupt or blocked storage: fall through to the sample.
  }
  return [samplePlan()];
}

export function savePlans(plans: GamePlan[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(plans));
  } catch {
    // Private mode or quota: the app still works for this visit.
  }
}

export function loadActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE);
  } catch {
    return null;
  }
}

export function saveActiveId(id: string): void {
  try {
    localStorage.setItem(ACTIVE, id);
  } catch {
    /* ignore */
  }
}

export function downloadPlan(plan: GamePlan): void {
  const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${plan.name.replace(/[^\w-]+/g, "-").toLowerCase() || "game-plan"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function readPlanFile(file: File): Promise<GamePlan> {
  return validatePlan(JSON.parse(await file.text()));
}
