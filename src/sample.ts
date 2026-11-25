import type { GamePlan, Position, Technique } from "./model";
import { uid } from "./model";

/** A starter closed-guard game so the app isn't empty on first open. */
export function samplePlan(): GamePlan {
  const p = (id: string, name: string, side: Position["side"], notes = ""): Position => ({ id, name, side, notes });
  const positions: Position[] = [
    p("standing", "Standing", "neutral", "Grip fight first. Don't let them get a collar tie and dictate."),
    p("closed-guard", "Closed guard (bottom)", "bottom", "Break posture before anything else. Hips off the mat."),
    p("half-guard-bottom", "Half guard (bottom)", "bottom", "Get the underhook or get on your side. Never flat."),
    p("mount", "Mount", "top", "Low and heavy, grapevine if they bridge."),
    p("side-control-top", "Side control (top)", "top", "Crossface and hip control. Kill the near-side underhook."),
    p("side-control-bottom", "Side control (bottom)", "bottom", "Frames first, then hip escape."),
    p("back", "Back control", "top", "Seatbelt, chest-to-back, hooks or body triangle."),
  ];
  const t = (
    name: string,
    type: Technique["type"],
    from: string,
    to: string | null,
    priority: Technique["priority"],
    trigger: string,
    notes = "",
  ): Technique => ({ id: uid(), name, type, from, to, priority, trigger, notes });

  const techniques: Technique[] = [
    t("Guard pull", "takedown", "standing", "closed-guard", "A", "I have collar + sleeve grips"),
    t("Single leg", "takedown", "standing", "side-control-top", "B", "They square up and reach"),
    t("Hip bump sweep", "sweep", "closed-guard", "mount", "A", "They sit up / post on hands"),
    t("Kimura", "submission", "closed-guard", null, "A", "They post a hand on the mat", "Chains straight into hip bump if they pull the arm back."),
    t("Armbar from guard", "submission", "closed-guard", null, "B", "Posture broken, arm across centerline"),
    t("Flower sweep", "sweep", "closed-guard", "mount", "learning", "They stand or posture tall"),
    t("Knee shield recovery", "transition", "half-guard-bottom", "closed-guard", "A", "They flatten me out"),
    t("Old school sweep", "sweep", "half-guard-bottom", "side-control-top", "B", "I have the underhook and get to my knees"),
    t("Cross collar choke", "submission", "mount", null, "A", "They defend the arm, neck exposed"),
    t("Take the back", "transition", "mount", "back", "A", "They turn away from the choke"),
    t("Rear naked choke", "submission", "back", null, "A", "Hand fight won, choking arm under chin"),
    t("Bow and arrow", "submission", "back", null, "B", "They defend the RNC with two hands"),
    t("Mount from side control", "transition", "side-control-top", "mount", "A", "They turn into me / push my head"),
    t("Hip escape to half guard", "escape", "side-control-bottom", "half-guard-bottom", "A", "Frames set, they drift their weight"),
  ];

  return {
    id: uid(),
    name: "Closed guard game (sample)",
    ruleset: "IBJJF Gi",
    startPosition: "standing",
    positions,
    techniques,
    updatedAt: Date.now(),
  };
}
