import type { GamePlan, Position, Priority, Side, TechType, Technique } from "./model";
import { uid } from "./model";

export interface LibraryTechnique {
  name: string;
  type: TechType;
  /** Library key of the position it lands in; null for submissions. */
  to: string | null;
  trigger: string;
  notes?: string;
}

export interface Threat {
  /** What the opponent does. */
  threat: string;
  /** Your answer. */
  answer: string;
}

export interface LibraryPosition {
  key: string;
  name: string;
  side: Side;
  family: "guard" | "top";
  gi?: "gi" | "no-gi";
  summary: string;
  goals: string[];
  grips: string[];
  principles: string[];
  mistakes: string[];
  threats: Threat[];
  techniques: LibraryTechnique[];
}

/** Positions techniques can land in that don't have a full write-up yet. */
export const DESTINATIONS: Record<string, { name: string; side: Side }> = {
  back: { name: "Back control", side: "top" },
  "top-half": { name: "Half guard (top)", side: "top" },
  "knee-on-belly": { name: "Knee on belly", side: "top" },
};

export const LIBRARY: LibraryPosition[] = [
  // ───────────────────────── GUARDS ─────────────────────────
  {
    key: "closed-guard",
    name: "Closed guard (bottom)",
    side: "bottom",
    family: "guard",
    summary:
      "Legs locked around their waist. The most controlling guard there is: they can't pass until they open it, and every time they post or posture wrong you get an attack.",
    goals: [
      "Break their posture before attacking: head and arms down, weight forward onto you.",
      "Get an angle. Hip out to one side; attacks from square are easy to defend.",
      "Make them post a hand. A posted hand opens the kimura, hip bump and arm drag.",
    ],
    grips: [
      "Gi: cross collar + same-side sleeve, or two sleeves.",
      "Overhook on one arm (strong for triangles, omoplata and armbars).",
      "No-gi: collar tie + wrist, two-on-one on a wrist, or high guard clamping the head and arm.",
    ],
    principles: [
      "Pull with your legs, not only your arms: knees toward your chest breaks posture.",
      "Control at least one arm at all times. Two free arms let them posture and grip your hips.",
      "When they posture up, sit up with them. That's the hip bump and guillotine window.",
      "Keep your ankles locked high on their back, not low on their hips.",
    ],
    mistakes: [
      "Lying flat and squeezing the legs: it stalls and lets them set up the guard break.",
      "Attacking before posture is broken, so they just pull the arm out.",
      "Letting them get both hands on your hips or belt with a straight back.",
      "Holding the guard closed after they've stood up. Open it on your terms instead.",
    ],
    threats: [
      { threat: "They posture up with hands on your hips.", answer: "Break a grip and sit up into the hip bump, or pull them back down with legs + collar." },
      { threat: "They stand up to break the guard.", answer: "Keep sleeve/collar grips, open the guard and switch to spider, butterfly or a pendulum (flower) sweep." },
      { threat: "Knee into your tailbone to pry your ankles open.", answer: "Open before they force it and put feet on hips or biceps, so you choose the open guard." },
      { threat: "They stack you to defend an armbar or triangle.", answer: "Angle off to the side and keep your hips from going over your head; finish at the angle." },
    ],
    techniques: [
      { name: "Hip bump sweep", type: "sweep", to: "mount", trigger: "They posture tall; you sit up and post a hand behind you" },
      { name: "Guillotine", type: "submission", to: null, trigger: "They defend the hip bump by driving forward and the head drops" },
      { name: "Kimura", type: "submission", to: null, trigger: "They post a hand on the mat" },
      { name: "Triangle", type: "submission", to: null, trigger: "One arm in, one arm out" },
      { name: "Armbar", type: "submission", to: null, trigger: "Posture broken and an arm crosses your centerline or pushes your chest" },
      { name: "Scissor sweep", type: "sweep", to: "mount", trigger: "Collar + sleeve, they come up on one knee or lean forward" },
      { name: "Pendulum (flower) sweep", type: "sweep", to: "mount", trigger: "Arm trapped and their weight is forward on their knees" },
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach or post a hand you can drag across" },
    ],
  },
  {
    key: "spider-guard",
    name: "Spider guard",
    side: "bottom",
    family: "guard",
    gi: "gi",
    summary:
      "Open guard with both sleeves gripped and the soles of your feet on their biceps. Controls distance and both arms; a gi guard built for sweeps, triangles and omoplatas.",
    goals: [
      "Keep both sleeve grips and at least one foot on a bicep at all times.",
      "Use the legs to stretch them out and stop them closing distance.",
      "Pull one arm while pushing the other to put them off balance, then sweep or attack the arm you pulled in.",
    ],
    grips: [
      "Two sleeves at the cuff, wrists bent, feet on biceps.",
      "Spider-lasso: one leg wraps around their arm, the other foot stays on the bicep.",
      "Spider + De La Riva hook when they step forward.",
    ],
    principles: [
      "Constant pressure through your feet. Loose feet mean free arms.",
      "Alternate one bent leg and one extended leg to move them around.",
      "Stay on an angle with your hips off the mat; follow them when they circle.",
      "If they grab your pants and stand tall, change structure (lasso or DLR) before they pass.",
      "Don't put fingers inside the sleeve opening: it's illegal under IBJJF rules. Grip the cloth from outside.",
    ],
    mistakes: [
      "Both legs straight and stiff: they push your legs down or stack you.",
      "Losing a sleeve grip and not replacing it right away.",
      "Staying square while they walk around your legs.",
      "Death-gripping with tired forearms; switch to the lasso to rest the grip.",
    ],
    threats: [
      { threat: "They break your grips by circling their hands or ripping the arm back.", answer: "Re-grip immediately or wrap that arm in a lasso; if both are lost, recover with feet on hips." },
      { threat: "Pants grips and a toreando or leg drag.", answer: "Pummel your knee back inside, turn into them, and re-insert a foot on the bicep or hip." },
      { threat: "They drive forward and stack you.", answer: "Pull the sleeve they're driving with into a triangle, or recover closed guard as they get close." },
    ],
    techniques: [
      { name: "Triangle from spider", type: "submission", to: null, trigger: "You pull one arm in while the other is pushed out by your foot" },
      { name: "Spider scissor sweep", type: "sweep", to: "mount", trigger: "They step a leg forward; chop the leg while pulling the sleeve" },
      { name: "Lasso sweep", type: "sweep", to: "mount", trigger: "Lasso on one arm and they lean their weight onto that side" },
      { name: "Omoplata from lasso", type: "submission", to: null, trigger: "They posture away or step to the lasso side" },
      { name: "Recover closed guard", type: "transition", to: "closed-guard", trigger: "They drop their hips and come in close" },
    ],
  },
  {
    key: "half-guard-bottom",
    name: "Half guard (bottom)",
    side: "bottom",
    family: "guard",
    summary:
      "You trap one of their legs between yours. On your side with the underhook it's an attacking guard; flat on your back with their crossface, it's the last step before being passed.",
    goals: [
      "Win the underhook on the side of the trapped leg, or frame with a knee shield until you can.",
      "Get on your side facing them. Never flat on your back.",
      "Come up (dogfight, old school sweep) or go underneath (deep half). Don't just hold.",
    ],
    grips: [
      "Underhook on the trapped-leg side, head tight to their chest.",
      "Knee shield (Z-guard): top knee across their hip or chest as a frame, with a collar or wrist grip.",
      "Deep half: under their hips, hugging the trapped leg.",
      "Lockdown (popular in no-gi): legs triangled around their leg to stretch them out.",
    ],
    principles: [
      "The fight is the underhook vs. their crossface. Whoever wins it usually wins the position.",
      "No underhook yet? Frame on the neck and hip, hip escape and get the knee shield in.",
      "Keep the trapped leg tight around the knee, not loose around the ankle.",
      "Head position matters: keep your head off the mat and out of their control.",
    ],
    mistakes: [
      "Flat on your back with their crossface and underhook: they walk to side control or mount.",
      "Reaching for the underhook without making space first.",
      "Holding the leg with no plan, which is pure defense.",
      "Leaving your underhook arm long when they're hunting the kimura.",
    ],
    threats: [
      { threat: "Crossface + far underhook to flatten you.", answer: "Frame on the neck, hip escape, re-insert the knee shield; turn back onto your side." },
      { threat: "Knee slice / knee cut pass.", answer: "Keep the knee shield as a frame, or underhook the cutting leg and come up." },
      { threat: "Whizzer on your underhook.", answer: "Come up on your knees into the dogfight, or switch under to deep half." },
      { threat: "Kimura on your underhook arm.", answer: "Keep your elbow tight to your ribs, grab your own belt or leg, and finish your sweep quickly." },
    ],
    techniques: [
      { name: "Old school sweep", type: "sweep", to: "top-half", trigger: "Underhook won, you come up to your knee and catch their trapped ankle" },
      { name: "Dogfight to back take", type: "transition", to: "back", trigger: "Underhook won and they lean over you or whizzer" },
      { name: "Kimura from half guard", type: "submission", to: null, trigger: "They post the near hand on the mat" },
      { name: "Recover closed guard", type: "transition", to: "closed-guard", trigger: "Knee shield framing and they free their leg upward" },
      { name: "Switch to butterfly", type: "transition", to: "butterfly-guard", trigger: "They sit back or back off to free their leg" },
    ],
  },
  {
    key: "butterfly-guard",
    name: "Butterfly guard",
    side: "bottom",
    family: "guard",
    summary:
      "Seated guard with your insteps hooked inside their thighs. It's a sweeping and back-taking guard, especially strong in no-gi: win the upper body, then lift with the hooks.",
    goals: [
      "Win the upper body first: underhook, overhook or arm drag, with your head high on their chest.",
      "Get their weight onto you before using the hooks.",
      "Take away their post on one side, then sweep toward that side.",
    ],
    grips: [
      "Over-under (one overhook, one underhook).",
      "Double underhooks.",
      "Arm drag / two-on-one on a wrist.",
      "Gi: collar + sleeve, or a belt grip over the back.",
    ],
    principles: [
      "Stay sitting up. Falling flat on your back kills butterfly guard.",
      "Hooks lift; they don't hold. If you're using them to hang on, the upper body is lost.",
      "Trap the arm on the side you sweep toward so they can't post.",
      "Fall to your side when sweeping, not straight back.",
    ],
    mistakes: [
      "Leaning back with no upper-body connection.",
      "Shallow hooks or pointed toes, which give you no lift.",
      "Letting them flatten you chest to chest.",
      "Sweeping without trapping the post arm, so they base out.",
    ],
    threats: [
      { threat: "They flatten you and smash with chest pressure.", answer: "Frame and angle out, then recover to half guard with the knee shield." },
      { threat: "Knee slice through your hooks.", answer: "Catch the knee with a knee shield or underhook the leg and go to half guard." },
      { threat: "Body lock / head-to-hip pressure.", answer: "Frame on the hips before they lock hands; turn to your side and re-guard or go to half guard." },
    ],
    techniques: [
      { name: "Butterfly (hook) sweep", type: "sweep", to: "mount", trigger: "Over-under, their arm trapped and their weight on you" },
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach or push your chest with one arm" },
      { name: "Guillotine", type: "submission", to: null, trigger: "They drive their head low or under your arm" },
      { name: "Wrestle up to single leg", type: "takedown", to: "side-control-top", trigger: "They sit back or stand; come up on your knee and finish the single" },
      { name: "Recover half guard", type: "transition", to: "half-guard-bottom", trigger: "They flatten you and pin a hook" },
    ],
  },

  // ───────────────────────── TOP ─────────────────────────
  {
    key: "side-control-top",
    name: "Side control (top)",
    side: "top",
    family: "top",
    summary:
      "Chest to chest across their body, both of their legs past you. Usually where you land after the pass, and the base for mount, knee on belly, north-south and arm attacks.",
    goals: [
      "Control head and hip: crossface plus far underhook, and block their near hip.",
      "Kill the near-side underhook so they can't turn into you or come to their knees.",
      "Advance (mount, knee on belly) or attack (kimura, americana, arm triangle) before they frame.",
    ],
    grips: [
      "Crossface + far underhook (standard).",
      "Near-arm control: their near arm trapped, your knee jammed into their hip.",
      "Kesa gatame (scarf hold) and reverse kesa when they move.",
      "Gi: deep collar under the neck, or a belt / pants grip at the far hip.",
    ],
    principles: [
      "Weight through your chest and shoulder into them, not resting on your knees.",
      "Hips low; knees tight to their hip and shoulder to block the hip escape.",
      "When they frame, move. Change angle or hip-switch rather than pushing into the frame.",
      "Their frames give you an arm. A straight arm or pushing arm is an attack.",
    ],
    mistakes: [
      "Hips high, so they bridge and roll you or shrimp under.",
      "Giving up the near-side underhook: they come to their knees or take your back.",
      "Leaving space at the hip, which they use to re-guard.",
      "No crossface, so they turn and face you.",
    ],
    threats: [
      { threat: "Hip escape to re-guard.", answer: "Block the hip with your knee, switch your hips, or go knee on belly as they shrimp." },
      { threat: "Near-side underhook to come up to their knees.", answer: "Sprawl, take the whizzer and crossface; walk to north-south or take the back." },
      { threat: "Bridge and roll.", answer: "Widen your base and drop your hips; don't put your weight on your knees." },
      { threat: "Frames on your neck and hip.", answer: "Walk off the frame and attack the extended arm (kimura, armbar), or step to knee on belly." },
    ],
    techniques: [
      { name: "Slide to mount", type: "transition", to: "mount", trigger: "Their near arm is pinned or their knees face away" },
      { name: "Kimura from side control", type: "submission", to: null, trigger: "They push your hip with the far arm" },
      { name: "Americana", type: "submission", to: null, trigger: "Far arm bent near their head, or they frame on your neck" },
      { name: "Arm triangle", type: "submission", to: null, trigger: "Their near arm pushes across your face or neck" },
      { name: "Step to knee on belly", type: "transition", to: "knee-on-belly", trigger: "They frame and make space at the hip" },
      { name: "Walk to north-south", type: "transition", to: "north-south", trigger: "They frame your head and hips to push you away" },
      { name: "Take the back", type: "transition", to: "back", trigger: "They turn away to their knees on the far side" },
    ],
  },
  {
    key: "mount",
    name: "Mount",
    side: "top",
    family: "top",
    summary:
      "Sitting on their torso with your knees on the mat beside them. Worth 4 points under IBJJF and full of attacks. The risks are the trap-and-roll and the elbow-knee escape.",
    goals: [
      "Stabilize low before you climb high.",
      "Separate an elbow from their body; that arm is your attack.",
      "Climb to high mount or S-mount (technical mount) to finish the armbar.",
    ],
    grips: [
      "Low mount with grapevines (feet hooked under their legs) to ride the bridge.",
      "Crossface + underhook (head and arm control).",
      "Gi: deep cross collar grip.",
      "High mount: knees up under their armpits.",
    ],
    principles: [
      "When they bridge, post your hand out wide on that side. Ride the bridge, don't fight it.",
      "Keep your knees tight to their body so they can't fit an elbow into the gap.",
      "Chain attacks: a choke threat raises their arms (armbar); covering the neck exposes an elbow.",
      "Keep your hands off the mat close to their body, where they can trap them.",
    ],
    mistakes: [
      "Sitting high on the stomach too early, so one bridge sends you over.",
      "Committing both arms to a choke, leaving no base when they trap and roll.",
      "Knees open and feet up, which gives them the elbow-knee escape.",
      "Chasing a submission they're defending instead of switching to the next one.",
    ],
    threats: [
      { threat: "Trap and roll (upa).", answer: "Keep your arm free of their trap, post wide on the bridge side, and grapevine if needed." },
      { threat: "Elbow-knee escape to half guard.", answer: "Pinch your knees, push their knee back to the mat, or switch to S-mount." },
      { threat: "Pushing your hips or chest away.", answer: "Their straight arm is the armbar. Climb to S-mount and take it." },
      { threat: "They turn onto their side.", answer: "Technical mount, then take the back with the seatbelt." },
    ],
    techniques: [
      { name: "Cross collar choke", type: "submission", to: null, trigger: "Deep collar grip and they keep their elbows tight" },
      { name: "Armbar from S-mount", type: "submission", to: null, trigger: "They push on your chest or hips to escape" },
      { name: "Americana", type: "submission", to: null, trigger: "An arm bends near their head or frames your neck" },
      { name: "Arm triangle", type: "submission", to: null, trigger: "They push across your chest with one arm" },
      { name: "Take the back", type: "transition", to: "back", trigger: "They turn to their side to escape" },
    ],
  },
  {
    key: "north-south",
    name: "North-south",
    side: "top",
    family: "top",
    summary:
      "Chest on their chest with your head toward their hips, aligned head to head. A heavy pin and a hub for switching sides, and home of the north-south choke and kimura.",
    goals: [
      "Pin their shoulders and chest so they can't turn to their knees.",
      "Use it to switch between the two sides of side control.",
      "Attack the arms and neck: north-south choke, kimura, armbar.",
    ],
    grips: [
      "Arms under their armpits gripping the belt (gi) or around their lats (no-gi).",
      "One arm wrapped under their arm for the kimura.",
      "For the choke: your arm under the neck along their shoulder line.",
    ],
    principles: [
      "Hips low, knees wide, up on your toes so you can move.",
      "Treat it as a transition, not a resting place. Walk side to side to make them chase you.",
      "Watch their hands on your hips; that's how they start the re-guard.",
      "Drop your hips and widen your base when they bridge.",
    ],
    mistakes: [
      "Hips high, so they push your hips away and shrimp back to guard.",
      "Leaving their elbows free: they underhook and turn to their knees.",
      "Staying static long enough for them to build frames.",
    ],
    threats: [
      { threat: "They push your hips and shrimp to re-guard.", answer: "Walk around to side control on the side they're moving toward." },
      { threat: "Bridge and turn to their knees.", answer: "Follow them to the front headlock or take the back as they turn." },
      { threat: "Underhooks on your body.", answer: "Attack the underhooking arm with the kimura." },
    ],
    techniques: [
      { name: "North-south choke", type: "submission", to: null, trigger: "Your arm is under their neck and their near shoulder is blocked" },
      { name: "Kimura from north-south", type: "submission", to: null, trigger: "They underhook or push your hip with one arm" },
      { name: "Back to side control", type: "transition", to: "side-control-top", trigger: "They turn to one side or start to re-guard" },
      { name: "Take the back", type: "transition", to: "back", trigger: "They turn to their knees" },
    ],
  },
];

export function libraryEntry(key: string | undefined): LibraryPosition | undefined {
  return key ? LIBRARY.find((l) => l.key === key) : undefined;
}

/** The library key a plan position corresponds to, if any. */
export function libraryKeyOf(pos: Position): string | undefined {
  const known = (k: string) => LIBRARY.some((l) => l.key === k) || k in DESTINATIONS;
  if (pos.libraryKey && known(pos.libraryKey)) return pos.libraryKey;
  return known(pos.id) ? pos.id : undefined;
}

export function findPlanPosition(plan: GamePlan, key: string): Position | undefined {
  return plan.positions.find((p) => libraryKeyOf(p) === key);
}

/** Library techniques this plan doesn't have yet from that position (matched by name). */
export function missingTechniques(plan: GamePlan, key: string): LibraryTechnique[] {
  const entry = libraryEntry(key);
  const pos = findPlanPosition(plan, key);
  if (!entry) return [];
  if (!pos) return entry.techniques;
  const mine = plan.techniques.filter((t) => t.from === pos.id);
  const names = new Set(mine.map((t) => t.name.trim().toLowerCase()));
  // A transition to the same place is the same move under another name ("Mount from side control" = "Slide to mount").
  const transitionsTo = new Set(mine.filter((t) => t.type === "transition" && t.to).map((t) => plan.positions.find((p) => p.id === t.to)));
  const coveredTransition = (t: LibraryTechnique) =>
    t.type === "transition" && [...transitionsTo].some((p) => p && libraryKeyOf(p) === t.to);
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
    positions.push({ id, name: meta.name, side: meta.side, notes: lib?.summary ?? "", libraryKey: k });
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
