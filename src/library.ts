import type { GamePlan, Position, Priority, Side, TechType, Technique } from "./model";
import { uid } from "./model";

/**
 * Every position has two sides:
 *  - control: what the person holding the position does (attacking side)
 *  - escape:  what the person stuck in it does (defending side)
 * For a guard, control belongs to the guard player and escapes to the passer.
 * For a top pin, control belongs to the top player and escapes to the bottom player.
 */
export type Role = "control" | "escape";

export type Topic = "key idea" | "grips" | "body position" | "pressure" | "distance" | "off-balance" | "mistake";
export const TOPICS: Topic[] = ["key idea", "grips", "body position", "pressure", "distance", "off-balance", "mistake"];

export interface Insight {
  id: string;
  position: string; // library key
  role: Role;
  topic: Topic;
  text: string;
  /** Practitioner or instructional it comes from. Empty = common coaching. */
  source?: string;
  /** Added by the user rather than built in. */
  user?: boolean;
}

export interface LibraryTechnique {
  name: string;
  type: TechType;
  /** Library key of the position it lands in; null for submissions. */
  to: string | null;
  trigger: string;
  notes?: string;
}

export type Group = "Closed & half guard" | "Spider & lasso family" | "Seated guards" | "Top pins" | "Other";
export const GROUPS: Group[] = ["Closed & half guard", "Spider & lasso family", "Seated guards", "Top pins", "Other"];

export interface LibraryPosition {
  key: string;
  name: string;
  /** Side of the person in control. Guards are controlled from the bottom. */
  side: Side;
  family: "guard" | "top";
  group: Group;
  gi?: "gi" | "no-gi";
  summary: string;
  /** Who is in control / who is escaping, in plain words. */
  controller: string;
  escaper: string;
  related: string[];
  insights: Insight[];
  techniques: LibraryTechnique[];
  user?: boolean;
}

/** Positions techniques can land in that don't have a full write-up yet. */
export const DESTINATIONS: Record<string, { name: string; side: Side }> = {
  back: { name: "Back control", side: "top" },
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

type Draft = Omit<LibraryPosition, "insights"> & { control: [Topic, string, string?][]; escapes: [Topic, string, string?][] };

function build(d: Draft): LibraryPosition {
  const { control, escapes, ...rest } = d;
  const mk = (role: Role) => ([topic, text, source]: [Topic, string, string?], i: number): Insight => ({
    id: `${d.key}:${role}:${i}`,
    position: d.key,
    role,
    topic,
    text,
    source,
  });
  return { ...rest, insights: [...control.map(mk("control")), ...escapes.map(mk("escape"))] };
}

const GUARD = { controller: "Guard player (bottom)", escaper: "Passer (top)" };
const PIN = { controller: "Top player", escaper: "Bottom player" };

export const LIBRARY: LibraryPosition[] = [
  // ───────────────────────── CLOSED & HALF ─────────────────────────
  build({
    key: "closed-guard",
    name: "Closed guard",
    side: "bottom",
    family: "guard",
    group: "Closed & half guard",
    ...GUARD,
    summary:
      "Legs locked around their waist. The most controlling guard there is: they can't pass until they open it, and every time they post or posture badly you get an attack.",
    related: ["half-guard-bottom", "spider-guard", "mount"],
    control: [
      ["key idea", "Posture is the whole fight. Break it before attacking: head and arms down, weight forward onto you."],
      ["key idea", "Attack from an angle, never square. Hip out to one side and the same attack gets twice as strong."],
      ["grips", "Control at least one arm at all times. Two free arms let them posture and grip your hips."],
      ["grips", "Gi: cross collar + same-side sleeve. No-gi: collar tie + wrist, two-on-one, or high guard clamping head and arm."],
      ["body position", "Ankles locked high on their back, not low on their hips where a knee in the tailbone opens them."],
      ["off-balance", "Pull with your legs, not just your arms: knees toward your chest breaks posture."],
      ["off-balance", "Make them post a hand. A posted hand opens kimura, hip bump and arm drag."],
      ["mistake", "Lying flat squeezing your legs. It stalls and gives them time to set up the guard break."],
      ["mistake", "Holding the guard closed after they stand. Open it on your terms instead."],
    ],
    escapes: [
      ["key idea", "Posture first, then open the guard. Never try to open it while bent forward."],
      ["body position", "Head up, back straight, hips forward; elbows tight inside your knees so they can't be isolated."],
      ["grips", "Two hands on their belt/hips or one on the collar and one on the hip; strip their grips before anything else."],
      ["key idea", "Choose your guard break: kneeling (knee into tailbone, open the ankles) or standing (stand in posture, then pop the ankles)."],
      ["mistake", "Putting a hand on the mat. That's the kimura and hip bump."],
      ["mistake", "One arm in, one arm out when the legs open. That's the triangle."],
    ],
    techniques: [
      { name: "Hip bump sweep", type: "sweep", to: "mount", trigger: "They posture tall; you sit up and post a hand behind you" },
      { name: "Kimura", type: "submission", to: null, trigger: "They post a hand on the mat" },
      { name: "Triangle", type: "submission", to: null, trigger: "One arm in, one arm out" },
      { name: "Armbar", type: "submission", to: null, trigger: "Posture broken and an arm crosses your centerline" },
      { name: "Scissor sweep", type: "sweep", to: "mount", trigger: "Collar + sleeve, they come up on one knee" },
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach or post a hand you can drag across" },
    ],
  }),
  build({
    key: "half-guard-bottom",
    name: "Half guard",
    side: "bottom",
    family: "guard",
    group: "Closed & half guard",
    ...GUARD,
    summary:
      "You trap one of their legs between yours. On your side with the underhook it's an attacking guard; flat on your back under their crossface it's the last step before being passed.",
    related: ["closed-guard", "butterfly-guard", "side-control-top"],
    control: [
      ["key idea", "The fight is your underhook against their crossface. Whoever wins it usually wins the position."],
      ["body position", "On your side facing them, never flat. Head off the mat and out of their control."],
      ["grips", "Underhook on the side of the trapped leg, head tight to their chest."],
      ["distance", "No underhook yet? Knee shield across their hip or chest as a frame, and hold the distance until you can win it."],
      ["key idea", "Lockdown: triangle your legs around their trapped leg and stretch them out to kill their base.", "Eddie Bravo"],
      ["key idea", "Deep half: get underneath their hips hugging the trapped leg; they lose their base without ever being flat on you.", "Bernardo Faria"],
      ["key idea", "Coyote / half-butterfly: a butterfly hook inside with the other leg on the half guard, to lift and come up.", "Lucas Leite"],
      ["mistake", "Holding the leg with no plan. Half guard is a place to come up or go under, not to rest."],
    ],
    escapes: [
      ["key idea", "Flatten them: crossface plus far underhook, chest heavy, so they can't turn into you."],
      ["pressure", "Win the head. Shoulder pressure on the jaw turns their face away and kills the underhook."],
      ["grips", "Whizzer their underhook, or pummel to your own underhook, before they come up."],
      ["distance", "Kill the knee shield by pinning it to the mat or getting your knee over it before you try to free the leg."],
      ["key idea", "Free the trapped leg last: flatten, then knee slice or switch base to pull the foot out."],
      ["mistake", "Leaving the underhook arm free to post. Bottom player comes up into a dogfight or takes the back."],
    ],
    techniques: [
      { name: "Old school sweep", type: "sweep", to: "top-half", trigger: "Underhook won, you come up and catch their trapped ankle" },
      { name: "Dogfight to back take", type: "transition", to: "back", trigger: "Underhook won and they lean over you or whizzer" },
      { name: "Kimura from half guard", type: "submission", to: null, trigger: "They post the near hand on the mat" },
      { name: "Switch to butterfly", type: "transition", to: "butterfly-guard", trigger: "They sit back to free their leg" },
    ],
  }),

  // ───────────────────────── SPIDER & LASSO FAMILY ─────────────────────────
  build({
    key: "spider-guard",
    name: "Spider guard",
    side: "bottom",
    family: "guard",
    group: "Spider & lasso family",
    gi: "gi",
    ...GUARD,
    summary:
      "Open guard with both sleeves gripped and the soles of your feet on their biceps. Controls distance and both arms. The root of a family of gi guards: lasso, spider-DLR, spider shin-to-shin.",
    related: ["lasso-guard", "spider-dlr", "spider-shin-to-shin", "closed-guard"],
    control: [
      ["key idea", "Both sleeves and at least one foot on a bicep at all times. If you lose a piece, replace it before attacking."],
      ["pressure", "Constant pressure through your feet. Loose feet mean free arms."],
      ["off-balance", "Push with one foot while pulling the other sleeve. Their arms move in opposite directions and their base breaks."],
      ["distance", "Alternate one bent leg and one extended leg: the straight leg holds distance, the bent one loads the next move."],
      ["body position", "Hips off the mat and on an angle; follow them when they circle."],
      ["grips", "Grip the sleeve cloth from outside. Fingers inside the sleeve opening are illegal under IBJJF rules."],
      ["key idea", "When they grab your pants and stand tall, change structure (lasso or DLR) before they start passing."],
      ["mistake", "Both legs straight and stiff: they push your legs down or stack you."],
    ],
    escapes: [
      ["key idea", "Break a sleeve grip first. Without the grips, spider guard is just feet on your arms."],
      ["grips", "Circle your hand toward their thumb, or turn the wrist and rip it back to your hip, to strip the sleeve grip."],
      ["body position", "Elbows in and down, close to your hips. A flared elbow gives them the bicep."],
      ["distance", "Don't stand at the end of their legs. Close the distance by pushing their knees together, or get far enough away that the feet stop working."],
      ["pressure", "Once the grips are broken, pin a leg to the mat and pass around it (toreando or leg drag) before they re-guard."],
      ["mistake", "Pulling the arm straight back against a foot. That's the triangle setup."],
    ],
    techniques: [
      { name: "Triangle from spider", type: "submission", to: null, trigger: "You pull one arm in while the other is pushed out by your foot" },
      { name: "Spider sweep", type: "sweep", to: "top-guard", trigger: "They step a leg forward; pull the sleeve and chop the leg" },
      { name: "Switch to lasso", type: "transition", to: "lasso-guard", trigger: "They pull an arm back or grab your pants" },
    ],
  }),
  build({
    key: "lasso-guard",
    name: "Lasso guard",
    side: "bottom",
    family: "guard",
    group: "Spider & lasso family",
    gi: "gi",
    ...GUARD,
    summary:
      "One leg wraps around the outside of their arm (the lasso) while you hold that sleeve; the other foot works on the hip, bicep or knee. Very hard to break and slow to pass, so it's good for long fights and tired opponents.",
    related: ["spider-guard", "dlr-lasso", "spider-dlr"],
    control: [
      ["key idea", "The lasso is a lever on their shoulder. You control their arm through the leg, not through your grip."],
      ["grips", "Same-side sleeve on the lasso arm; the other hand on the far sleeve, collar or pants, depending on the second leg."],
      ["body position", "Lasso knee pointed outward and your shin across the back of their arm. If your knee caves in, the lasso loosens."],
      ["off-balance", "Extend the lasso leg to pull their shoulder forward and down. Combine it with the other foot pushing to break their base."],
      ["distance", "The second leg decides everything: on the bicep (spider-lasso), on the hip, or hooked behind the leg (DLR-lasso)."],
      ["mistake", "Lasso with no second leg working. They walk around to the lasso side and pass."],
    ],
    escapes: [
      ["key idea", "Don't pull the lasso arm straight back. That tightens it. Bring the elbow in toward your hip instead."],
      ["key idea", "Deal with the free leg first. A lasso without the second leg working is only a grip."],
      ["pressure", "Drive your weight down onto the lasso leg and pin it, then walk toward the lasso side."],
      ["grips", "Break the sleeve grip on the lasso arm; once it's gone, slide your hand out from under the leg."],
      ["mistake", "Standing tall and square. You give them the room to swing the lasso sweep."],
    ],
    techniques: [
      { name: "Lasso sweep", type: "sweep", to: "top-guard", trigger: "They lean their weight onto the lasso side" },
      { name: "Omoplata from lasso", type: "submission", to: null, trigger: "They posture away or step to the lasso side" },
      { name: "Triangle", type: "submission", to: null, trigger: "They pull the non-lasso arm out of your grip" },
    ],
  }),
  build({
    key: "spider-dlr",
    name: "Spider–De La Riva hybrid",
    side: "bottom",
    family: "guard",
    group: "Spider & lasso family",
    gi: "gi",
    ...GUARD,
    summary:
      "A De La Riva hook around their lead leg plus a spider foot on the far bicep. The DLR hook controls the leg and hips; the spider foot controls the far arm and the distance. (De La Riva guard is named after Ricardo de la Riva.)",
    related: ["spider-guard", "dlr-lasso", "lasso-guard"],
    control: [
      ["key idea", "Two systems: the DLR hook controls their lower body, the spider foot controls their upper body. They can't fix both at once."],
      ["grips", "Typical: same-side ankle or pants grip on the hooked leg, cross sleeve for the spider foot."],
      ["body position", "DLR hook deep, with your knee pointed outward and your foot hooked inside their thigh. Hips close to their hooked heel."],
      ["off-balance", "Extend the spider foot while pulling the sleeve to load their weight onto the hooked leg, which can't step."],
      ["key idea", "If they turn into the hook, switch to the back-take side; if they turn away, sweep toward the spider side."],
      ["mistake", "Hips far from their heel. The DLR hook goes shallow and they kick free."],
    ],
    escapes: [
      ["key idea", "Kill the DLR hook first: free your lead leg by stepping it back or turning the knee in, which pops the hook."],
      ["grips", "Strip the ankle grip. Without it the DLR hook can't hold the leg."],
      ["body position", "Get your hips low and close; a tall stance makes the hook stronger."],
      ["distance", "Break the spider grip on the far arm so you can use that hand to post or to pin their knee."],
      ["mistake", "Pushing forward into the spider foot. That's the energy they use to off-balance you."],
    ],
    techniques: [
      { name: "DLR trip sweep", type: "sweep", to: "top-guard", trigger: "Their weight loads onto the hooked leg" },
      { name: "Berimbolo / back take", type: "transition", to: "back", trigger: "They sit back or widen their base against the sweep" },
      { name: "Triangle from spider foot", type: "submission", to: null, trigger: "They pull the spider arm out" },
    ],
  }),
  build({
    key: "dlr-lasso",
    name: "De La Riva–lasso",
    side: "bottom",
    family: "guard",
    group: "Spider & lasso family",
    gi: "gi",
    ...GUARD,
    summary:
      "A De La Riva hook on their lead leg plus a lasso on the far arm. The lasso slows their upper body while the DLR hook pulls them off base: one of the hardest open guards to pass in the gi.",
    related: ["lasso-guard", "spider-dlr"],
    control: [
      ["key idea", "Lasso freezes the upper body, DLR attacks the base. They need both hands and both legs to defend."],
      ["grips", "Sleeve grip on the lassoed arm, ankle or pants on the DLR leg."],
      ["body position", "Lasso knee pointed outward with your shin tight on the arm; DLR hip close to their heel."],
      ["off-balance", "Extend the lasso and pull the ankle at the same time. Their weight falls onto the hooked leg."],
      ["mistake", "Letting the lasso loosen while you fight for the DLR side. The lasso is your anchor."],
    ],
    escapes: [
      ["key idea", "Pick one problem: free the DLR leg first in most cases, because the lasso alone is easier to pass."],
      ["grips", "Strip the ankle grip, then step the hooked leg back out of the DLR hook."],
      ["pressure", "Keep the lassoed elbow tucked toward your hip and pressure down on the lasso leg."],
      ["mistake", "Trying to free the lassoed arm by pulling. You lift your own base off the ground."],
    ],
    techniques: [
      { name: "DLR–lasso sweep", type: "sweep", to: "top-guard", trigger: "They step forward or put weight on the hooked leg" },
      { name: "Omoplata from lasso", type: "submission", to: null, trigger: "They step to the lasso side" },
    ],
  }),
  build({
    key: "spider-shin-to-shin",
    name: "Spider + shin-to-shin",
    side: "bottom",
    family: "guard",
    group: "Spider & lasso family",
    gi: "gi",
    ...GUARD,
    summary:
      "Spider foot on one bicep with a sleeve grip, and your other shin across the front of their shin. It's the combination Michelle Nicolini is known for: the spider side holds the upper body while the shin elevates and off-balances the leg.",
    related: ["spider-guard", "seated-guard", "spider-dlr"],
    control: [
      ["key idea", "Upper body held at distance by the spider foot, lower body controlled by your shin against theirs."],
      ["grips", "Sleeve grip on the spider side; the other hand on their ankle or pants on the shin-to-shin leg."],
      ["body position", "Your shin crosses in front of theirs, your foot curled outside their leg. Hips close to that leg."],
      ["off-balance", "Lift their leg with your shin while your spider foot pushes the arm. They lose the leg and the post on the same side."],
      ["key idea", "From shin-to-shin you can enter deeper leg positions (single-leg X) or come up on the leg."],
      ["mistake", "Shin too low on their leg, near the ankle. You can't lift them from there."],
    ],
    escapes: [
      ["key idea", "Break the spider grip first; once the arm is free you can post or pin the shin."],
      ["body position", "Step the controlled leg back and away to remove the shin before they lift it."],
      ["pressure", "Drop your knee onto their shin-to-shin leg and pin it to the mat."],
      ["mistake", "Standing heavy on the controlled leg. That's exactly the leg they want to lift."],
    ],
    techniques: [
      { name: "Shin-to-shin elevation sweep", type: "sweep", to: "top-guard", trigger: "Their weight is on the controlled leg" },
      { name: "Come up on the leg", type: "takedown", to: "top-guard", trigger: "They pull back against the spider foot" },
    ],
  }),

  // ───────────────────────── SEATED ─────────────────────────
  build({
    key: "seated-guard",
    name: "Seated guard",
    side: "bottom",
    family: "guard",
    group: "Seated guards",
    ...GUARD,
    summary:
      "Sitting upright facing a standing or kneeling opponent, feet active, hands hand-fighting. The default engagement guard in modern no-gi and the hub for butterfly, shin-to-shin, single-leg X and wrestling up.",
    related: ["sit-up-guard", "butterfly-guard", "spider-shin-to-shin"],
    control: [
      ["key idea", "Inside position: whoever gets their knees and elbows inside the other person's wins the exchange.", "John Danaher"],
      ["body position", "Sit up with your weight on your butt and one hand. Chest up, head forward, never leaning back."],
      ["grips", "Hand-fight: two-on-one, collar tie, or wrist control. A grip on their wrist stops them from pushing your head down."],
      ["distance", "Feet stay active: on hips, on knees, or between their legs, always ready to re-insert."],
      ["key idea", "Seated guard is a hub, not a destination. From here you move to butterfly, shin-to-shin, an arm drag, or come up on a leg."],
      ["mistake", "Sitting back on your hands. They push your head or knees down and pass."],
    ],
    escapes: [
      ["key idea", "Don't engage at their range. Either stay out of reach of their feet and grips, or close in all at once."],
      ["grips", "Win the hands first: control their wrists or push their head back to put them flat."],
      ["pressure", "Push their head down and back; a seated guard with its head pushed back is just someone lying down."],
      ["distance", "Clear their feet to the side (toreando-style) instead of walking straight into them."],
      ["mistake", "Reaching down for their legs with your head forward. You give them the front headlock, arm drag or guillotine."],
    ],
    techniques: [
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach for you or post a hand" },
      { name: "Wrestle up on a leg", type: "takedown", to: "top-guard", trigger: "They sit back or stand tall" },
      { name: "Insert butterfly hooks", type: "transition", to: "butterfly-guard", trigger: "They kneel or come in close" },
    ],
  }),
  build({
    key: "sit-up-guard",
    name: "Sit-up guard",
    side: "bottom",
    family: "guard",
    group: "Seated guards",
    ...GUARD,
    summary:
      "A half-seated attacking guard: posted on one hand, chest up and driving forward, the free arm hunting an underhook, an arm or a leg. You come into them instead of holding them off.",
    related: ["seated-guard", "butterfly-guard", "half-guard-bottom"],
    control: [
      ["key idea", "Forward pressure is the control. Sit-up guard only works while you're coming at them."],
      ["body position", "Posted on one hand behind you, hips loaded, the other knee up; ready to come up on your feet (technical stand) at any moment."],
      ["grips", "Free arm attacks: overhook or underhook on the arm, or reach for the far leg."],
      ["off-balance", "Sit into them to put their weight back on their heels, then come up or sweep."],
      ["key idea", "The arm drag was the centrepiece of Marcelo Garcia's seated and butterfly game: drag the arm across, get to the back.", "Marcelo Garcia"],
      ["mistake", "Stalling on your posting hand. If you're not moving forward, they'll push you flat."],
    ],
    escapes: [
      ["key idea", "Attack the post: kick out or pull the posting arm and they fall flat."],
      ["pressure", "Push their head down and to the side of the posting hand to stop the sit-up."],
      ["distance", "Back away out of reach. Sit-up guard needs contact to work."],
      ["mistake", "Leaning forward over them with your head low. That's the guillotine and the front headlock."],
    ],
    techniques: [
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach or push on your chest" },
      { name: "Technical stand / wrestle up", type: "takedown", to: "top-guard", trigger: "Their weight comes back onto their heels" },
      { name: "Guillotine", type: "submission", to: null, trigger: "Their head drops as they push into you" },
    ],
  }),
  build({
    key: "butterfly-guard",
    name: "Butterfly guard",
    side: "bottom",
    family: "guard",
    group: "Seated guards",
    ...GUARD,
    summary:
      "Seated with your insteps hooked inside their thighs. A sweeping and back-taking guard, especially strong in no-gi: win the upper body, then lift with the hooks.",
    related: ["seated-guard", "sit-up-guard", "half-guard-bottom"],
    control: [
      ["key idea", "Win the upper body first. Hooks only work once their weight is on you."],
      ["grips", "Over-under, double underhooks, arm drag, or (gi) collar + sleeve or a belt grip over the back."],
      ["body position", "Sit up with your head high on their chest. Falling flat on your back kills butterfly guard."],
      ["off-balance", "Trap the arm on the side you sweep toward so they can't post, then fall to your side, not straight back."],
      ["key idea", "Hooks lift; they don't hold. If you're using them to hang on, the upper body is lost."],
      ["key idea", "Arm drag is the main attack from here: drag the arm across and take the back.", "Marcelo Garcia"],
      ["mistake", "Shallow hooks or pointed toes, which give you no lift."],
    ],
    escapes: [
      ["key idea", "Flatten them. Butterfly guard dies when their back touches the mat."],
      ["pressure", "Chest to chest, head on their chest or under their chin, and drive forward."],
      ["grips", "Fight for your own underhooks so they can't trap an arm; post your hand wide on the side they sweep toward."],
      ["distance", "Clear one hook by stepping that leg back or pinning it with your knee, then pass to the cleared side."],
      ["mistake", "Kneeling tall at arm's length. That's exactly the distance where the hooks lift you."],
    ],
    techniques: [
      { name: "Butterfly (hook) sweep", type: "sweep", to: "top-guard", trigger: "Over-under, their arm trapped, weight on you" },
      { name: "Arm drag to back", type: "transition", to: "back", trigger: "They reach or push your chest with one arm" },
      { name: "Guillotine", type: "submission", to: null, trigger: "They drive their head low or under your arm" },
      { name: "Recover half guard", type: "transition", to: "half-guard-bottom", trigger: "They flatten you and pin a hook" },
    ],
  }),

  // ───────────────────────── TOP PINS ─────────────────────────
  build({
    key: "side-control-top",
    name: "Side control",
    side: "top",
    family: "top",
    group: "Top pins",
    ...PIN,
    summary:
      "Chest to chest across their body, both legs passed. Usually where you land after the pass, and the base for mount, knee on belly, north-south and arm attacks.",
    related: ["mount", "north-south", "half-guard-bottom"],
    control: [
      ["key idea", "Control the head and the hip. Crossface turns their head away; your knee or hand blocks the near hip."],
      ["key idea", "Kill the near-side underhook. If they get it, they come to their knees or take your back."],
      ["pressure", "Weight through your chest and shoulder into them, not resting on your knees. Hips low."],
      ["body position", "Knees tight to their hip and shoulder so there's no space to shrimp into."],
      ["grips", "Crossface + far underhook, or switch to kesa gatame / reverse kesa as they move."],
      ["key idea", "When they frame, move. Change the angle instead of pushing into the frame. Frames hand you an arm to attack."],
      ["mistake", "Hips high: they bridge you or shrimp underneath."],
    ],
    escapes: [
      ["key idea", "Survival before escape: get into a safe defensive posture first, then escape. Don't explode from a bad position.", "Saulo Ribeiro (Jiu-Jitsu University)"],
      ["body position", "Turn onto your side facing them. Never flat on your back."],
      ["distance", "Frames: forearm on the neck or collarbone, other hand on the hip. Frames hold space; they don't push."],
      ["key idea", "Bridge first to make space, then shrimp into the space you made: the bridge gives the room, the shrimp uses it."],
      ["grips", "Fight for the near-side underhook. With it, come up to your knees; without it, re-guard."],
      ["mistake", "Pushing with straight arms. You burn out and give them an armbar or kimura."],
    ],
    techniques: [
      { name: "Slide to mount", type: "transition", to: "mount", trigger: "Their near arm is pinned or their knees face away" },
      { name: "Kimura from side control", type: "submission", to: null, trigger: "They push your hip with the far arm" },
      { name: "Americana", type: "submission", to: null, trigger: "Far arm bent near their head" },
      { name: "Arm triangle", type: "submission", to: null, trigger: "Their near arm pushes across your face" },
      { name: "Step to knee on belly", type: "transition", to: "knee-on-belly", trigger: "They frame and make space at the hip" },
      { name: "Walk to north-south", type: "transition", to: "north-south", trigger: "They frame your head and hips" },
    ],
  }),
  build({
    key: "mount",
    name: "Mount",
    side: "top",
    family: "top",
    group: "Top pins",
    ...PIN,
    summary:
      "Sitting on their torso with your knees on the mat beside them. Worth 4 points under IBJJF and full of attacks. The risks are the trap-and-roll and the elbow-knee escape.",
    related: ["side-control-top", "north-south"],
    control: [
      ["key idea", "Stabilize low before you climb high. Low mount to hold, high mount to attack."],
      ["body position", "Knees tight to their body so they can't fit an elbow into the gap. Grapevine the legs if they bridge a lot."],
      ["pressure", "Weight on their chest through your hips, not on your knees."],
      ["off-balance", "Ride the bridge, don't fight it. Post your hand wide on the side they bridge toward."],
      ["key idea", "Separate an elbow from their body; that arm is your attack. Climb to S-mount to finish it."],
      ["key idea", "Keep it simple and heavy. Roger Gracie won at the top level with mount and a cross collar choke, with the armbar ready when they defend the neck.", "Roger Gracie"],
      ["mistake", "Committing both arms to a choke. You've got no base when they trap and roll."],
    ],
    escapes: [
      ["key idea", "Survival first: elbows tight to your ribs, hands protecting the neck, so you can't be submitted while you work.", "Saulo Ribeiro (Jiu-Jitsu University)"],
      ["key idea", "Two main escapes: trap and roll (upa) when they're high or posting, elbow-knee when they're low and heavy."],
      ["grips", "Trap and roll: trap an arm AND the foot on the same side, then bridge over that shoulder."],
      ["body position", "Elbow-knee: frame on their hip, turn to your side, and slide your elbow to your knee to recover half guard."],
      ["mistake", "Pushing on their chest with straight arms. That's the armbar."],
      ["mistake", "Turning your back to escape. You give up the back with hooks."],
    ],
    techniques: [
      { name: "Cross collar choke", type: "submission", to: null, trigger: "Deep collar grip and they keep their elbows tight" },
      { name: "Armbar from S-mount", type: "submission", to: null, trigger: "They push on your chest or hips" },
      { name: "Americana", type: "submission", to: null, trigger: "An arm bends near their head" },
      { name: "Take the back", type: "transition", to: "back", trigger: "They turn to their side to escape" },
    ],
  }),
  build({
    key: "north-south",
    name: "North-south",
    side: "top",
    family: "top",
    group: "Top pins",
    ...PIN,
    summary:
      "Chest on their chest with your head toward their hips, aligned head to head. A heavy pin and a hub for switching sides, and home of the north-south choke and kimura.",
    related: ["side-control-top", "mount"],
    control: [
      ["key idea", "Treat it as a transition, not a resting place. Walk side to side and make them chase you."],
      ["pressure", "Chest heavy on their chest; hips low, knees wide, up on your toes so you can move."],
      ["grips", "Arms under their armpits to the belt (gi) or around the lats (no-gi); control the elbows so they can't underhook."],
      ["key idea", "Marcelo Garcia made the north-south choke a signature finish: arm under the neck along the shoulder line, drop your weight.", "Marcelo Garcia"],
      ["mistake", "Hips high. They push your hips away and shrimp back to guard."],
    ],
    escapes: [
      ["key idea", "Get your elbows inside and turn to one side; flat on your back is where north-south is strongest."],
      ["distance", "Frame on their hips, not their head, and shrimp to bring your legs back in."],
      ["key idea", "Bridge and turn to your knees as they walk around. Once you're on your knees, it's a new fight."],
      ["mistake", "Keeping your near arm loose. That's the north-south choke or kimura."],
    ],
    techniques: [
      { name: "North-south choke", type: "submission", to: null, trigger: "Your arm is under their neck and their near shoulder is blocked" },
      { name: "Kimura from north-south", type: "submission", to: null, trigger: "They underhook or push your hip" },
      { name: "Back to side control", type: "transition", to: "side-control-top", trigger: "They turn to one side to re-guard" },
    ],
  }),
];

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
