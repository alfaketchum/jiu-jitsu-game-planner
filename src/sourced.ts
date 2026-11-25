import type { Attire, Insight, Role, Topic } from "./libraryTypes";

/*
 * Insights from named practitioners, each tied to a page that was downloaded and read.
 * `via` says what kind of page it is: their own words (interview/video write-up), an
 * official product page (chapter titles), a blog breakdown, or an independent review.
 * Researched November 2026. Add more in the same shape.
 */

type S = {
  position: string;
  role: Role;
  topic: Topic;
  text: string;
  url: string;
  via: string;
  gi?: Attire;
};

const CHEN = "Jozef Chen";
const JONES = "Craig Jones";
const RYAN = "Gordon Ryan";
const MIKEY = "Mikey Musumeci";
const MARCELO = "Marcelo Garcia";
const LEPRI = "Lucas Lepri";
const NICKY = "Nicky Ryan";

const BJJMORE = "BJJMore course review";
const FANATICS_BLOG = "BJJ Fanatics blog breakdown";
const FANATICS_PRODUCT = "BJJ Fanatics course chapters";
const GRACIEMAG = "Graciemag video write-up (via Sensō)";

const chen = {
  tripod: "https://bjjmore.com/tripod-passing-jozef-chen/",
  engage: "https://bjjmore.com/engaging-without-regrets-jozef-chen/",
  jpoint: "https://bjjmore.com/outside-passing-jpoint-camping-jozef-chen/",
};
const jones = {
  zguard: "https://bjjmore.com/make-z-guard-great-again-review-craig-jones/",
  ride: "https://bjjmore.com/craig-jones-power-ride-review/",
};
const ryan = {
  triangle: "https://sensobjj.com/blogs/graciemag-1/gordon-ryan-details-how-to-escape-the-body-triangle",
  mount: "https://bjjmore.com/gordon-ryan-mount-system-review/",
  pins: "https://bjjmore.com/gordon-ryan-pin-escapes/",
  mountGraciemag: "https://sensobjj.com/blogs/graciemag-1/gordon-ryan-shares-a-simple-secret-to-attacking-from-mount",
  mountNewsletter: "https://bjjcoach.substack.com/p/mount-control-by-gordon-ryan-stupid",
};
const mikey = {
  bullfight: "https://bjjfanatics.com/blogs/news/bullfight-pass-defense-from-mikey-musumeci",
  killer: "https://bjjfanatics.com/blogs/news/5-killer-moves-from-2-time-black-belt-world-champion-mikey-musumeci",
  minutiae: "https://bjjfanatics.com/blogs/news/minutiae-with-mikey-details-in-jiu-jitsu",
};
const lepri = {
  course: "https://bjjfanatics.com/products/the-sit-up-guard-by-lucas-lepri",
  review: "https://bjjmore.com/lucas-lepri-sit-up-guard/",
};
/** B-Team's "No-Gi Mount Masterclass with Nicky Ryan", linked at the timestamp of each point. */
const nickyAt = (seconds: number) => `https://www.youtube.com/watch?v=sTn25xj9UGw&t=${seconds}s`;
const NICKY_VIA = "B-Team video (from a timestamped summary)";

const marcelo = {
  kick: "https://bjjfanatics.com/blogs/news/learn-marcelo-garcia-s-famous-butterfly-kick-sweep",
  ns: "https://bjjfanatics.com/blogs/news/learn-marcelo-garcia-s-famous-north-south-choke",
  guillotine: "https://bjjfanatics.com/blogs/news/this-guillotine-set-up-with-marcelo-garcia-is-money",
  xguard: "https://bjjfanatics.com/products/the-marcelo-x-guard-by-marcelo-garcia",
};

const RAW: Record<string, S[]> = {
  [CHEN]: [
    { position: "butterfly-guard", role: "escape", topic: "pressure", url: chen.tripod, via: BJJMORE,
      text: "Butterfly hooks can only lift weight that's on them. Put your weight on your head (the crown, not the forehead) with your hips high: he says 60–70% of his weight goes there." },
    { position: "butterfly-guard", role: "escape", topic: "body position", url: chen.tripod, via: BJJMORE,
      text: "In the tripod, bring your knee up to your elbow and keep that foot off the floor. A leg left on the mat is weight his hooks can lift." },
    { position: "butterfly-guard", role: "escape", topic: "mistake", url: chen.tripod, via: BJJMORE,
      text: "Legs wide in the tripod: his feet pummel under your knees and lift you. Pinch your knees slightly, and keep your post foot level with his hips." },
    { position: "butterfly-guard", role: "escape", topic: "mistake", url: chen.tripod, via: BJJMORE,
      text: "Forcing the tripod once he's under your hips and lifting. Know when to call it quits: post, push away and reset." },
    { position: "half-butterfly", role: "escape", topic: "key idea", url: chen.tripod, via: BJJMORE,
      text: "Don't try to beat two butterfly hooks at once. Make him give one up: half butterfly is his preferred passing position. Then beat the last hook." },
    { position: "half-butterfly", role: "escape", topic: "grips", url: chen.tripod, via: BJJMORE,
      text: "If he frames only on your chest there's no arm to underhook. Pin that wrist across with a cross-wrist grip; when his other hand comes to your knee, underhook that arm." },
    { position: "half-guard-bottom", role: "escape", topic: "key idea", url: chen.tripod, via: BJJMORE,
      text: "A knee shield only works while his knee sits between you. Switch your knees and step across his hip to take the shield away." },
    { position: "half-guard-bottom", role: "escape", topic: "body position", url: chen.tripod, via: BJJMORE,
      text: "Against a locked half guard (his foot behind your knee), grab his top ankle and straighten your trapped leg to pry his feet apart." },
    { position: "seated-guard", role: "escape", topic: "body position", url: chen.engage, via: BJJMORE,
      text: "Seated, he can move; flat, he can frame. Push him in between, shoulders behind his hips, and drive in there, where he can do neither." },
    { position: "seated-guard", role: "escape", topic: "grips", url: chen.engage, via: BJJMORE,
      text: "When he sits on one hip, hold the leg on that side. It's the only leg he can stand up on." },
    { position: "seated-guard", role: "escape", topic: "grips", url: chen.engage, via: BJJMORE,
      text: "Attack where his hands aren't: if they guard his ankles, post on his shoulder; when they come up, go back to the ankles. Against a two-on-one, tight elbows mean move his body, loose elbows mean strip the grip." },
    { position: "shin-to-shin", role: "escape", topic: "kuzushi", url: chen.engage, via: BJJMORE,
      text: "Drive your knee straight to his same-side hip, not across to the far hip. Across, he lifts your foot and gets into your legs; straight in, he tips onto his back." },
    { position: "open-guard", role: "escape", topic: "key idea", url: chen.jpoint, via: BJJMORE,
      text: "Once you're past his feet at his side (J-point), don't rush. Stop both legs from coming back in front of you and make him hold your weight on his frames until he opens up." },
    { position: "open-guard", role: "escape", topic: "grips", url: chen.jpoint, via: BJJMORE,
      text: "Beat each frame by what it pushes on: a post on your near shoulder, take the wrist and drag it across; both shoulders blocked, put your head inside his arm and come in on the side he stopped framing." },
    { position: "lasso-guard", role: "escape", topic: "body position", url: chen.jpoint, via: BJJMORE,
      text: "When his foot comes up for the lasso, touch your ear to your own bicep so there's no gap. If a shallow lasso is in, move your hips into him rather than sitting back; the wrap goes slack." },
  ],

  [JONES]: [
    { position: "low-knee-shield", role: "control", topic: "key idea", url: jones.zguard, via: BJJMORE,
      text: "Treat the knee shield as a retention tool first. \"The only difference between half guard and knee shield is the knee\": keep it in front." },
    { position: "low-knee-shield", role: "control", topic: "body position", url: jones.zguard, via: BJJMORE,
      text: "Get your bottom leg deep between his legs so you can cross your feet around his leg. Crossed feet are the strongest version and keep your knee in front." },
    { position: "low-knee-shield", role: "control", topic: "mistake", url: jones.zguard, via: BJJMORE,
      text: "A shin wrap against an explosive partner: if he sprawls back hard your toes get trapped and it works like a heel hook on you." },
    { position: "low-knee-shield", role: "control", topic: "pressure", url: "https://bjjfanatics.com/blogs/news/embrace-the-smash-with-z-guard", via: FANATICS_BLOG,
      text: "When the passer drives in to smash the Z-guard, trap his posture first, then use his forward pressure to swing into attacks like the choi bar." },
    { position: "low-knee-shield", role: "control", topic: "key idea", url: jones.zguard, via: BJJMORE,
      text: "Against a strong top player, fix it with position, not grip: \"The answer is never to just squeeze harder.\"" },
    { position: "low-knee-shield", role: "control", topic: "key idea", url: jones.zguard, via: BJJMORE,
      text: "Going to the legs from the knee shield: \"We need to threaten sweep first, leg lock second.\"" },
    { position: "low-knee-shield", role: "escape", topic: "key idea", url: jones.zguard, via: BJJMORE,
      text: "The weave pass is the one he finds hardest to deal with: \"the pass that causes me the most issues when playing knee shield.\"" },
    { position: "half-guard-bottom", role: "control", topic: "grips", url: jones.zguard, via: BJJMORE,
      text: "Flattened out of the knee shield into underhook half guard: if he whizzers, bring the underhook hand up to his face and push to open the whizzer arm." },
    { position: "half-guard-bottom", role: "escape", topic: "key idea", url: jones.ride, via: BJJMORE,
      text: "On top, you don't have to rush past half guard: \"Half guard is a pin. It is not a guard.\" Keep their trapped leg as an anchor and cup the near shoulder." },
    { position: "side-control-top", role: "control", topic: "key idea", url: jones.ride, via: BJJMORE,
      text: "Pin the legs, not just the chest. \"He can bridge if his feet are on the floor.\" Take that away with leg splits, an Achilles hook, or crossing your feet over both Achilles." },
    { position: "back", role: "control", topic: "body position", url: jones.ride, via: BJJMORE,
      text: "Flatten him belly down before you choke; attack while he's on his side and he turns into you. Belly-down back is \"the best position in all of jujitsu.\"" },
    { position: "turtle", role: "control", topic: "key idea", url: jones.ride, via: BJJMORE,
      text: "Don't dive for both hooks. Stay on top and take away a post (a foot, or the arm he pushes up on) so he can't build height." },
    { position: "butterfly-guard", role: "control", topic: "grips", url: "https://bjjfanatics.com/blogs/news/heel-hook-from-butterfly-guard-for-bjj-by-craig-jones", via: FANATICS_BLOG,
      text: "Before elevating into a leg entry, reach in and grab his toes or leg so he can't sprawl on you." },
    { position: "inside-sankaku", role: "escape", topic: "mistake", url: "https://www.bjjee.com/articles/defend-against-the-heel-hook-with-these-tips-from-craig-jones/", via: "BJJEE article",
      text: "Defending a heel hook like an ankle lock. Flexing your foot or turning toward him exposes the heel; point your toes instead." },
    { position: "inside-sankaku", role: "escape", topic: "key idea", url: "https://sensobjj.com/blogs/graciemag-1/craig-jones-explains-efficient-heel-hook-defense-concepts", via: GRACIEMAG,
      text: "Defend the heel hook as a ladder: point the toes, turn foot and knee away, plant the foot, turn your hips away. Repeat the turn as often as it takes to clear the knee line." },
    { position: "fifty-fifty", role: "control", topic: "mistake", url: "https://bjjfanatics.com/blogs/news/finishing-tips-with-craig-jones", via: FANATICS_BLOG,
      text: "Finishing the heel hook flat on your back: he lifts his hips and follows. Point his knee at the ceiling, inside knee on the floor, bridge your hips into him." },
  ],

  [RYAN]: [
    { position: "back", role: "escape", topic: "key idea", url: ryan.triangle, via: GRACIEMAG,
      text: "Neck first. Your primary hand stays on the choking arm; only the secondary hand works their legs. \"I cannot just put my hands down and play with Bernardo's feet and get strangled.\"" },
    { position: "back", role: "escape", topic: "mistake", url: ryan.triangle, via: GRACIEMAG,
      text: "Carrying on after they strip your primary hand. Stop and replace it before you continue the escape." },
    { position: "back", role: "escape", topic: "grips", url: "https://www.bjjee.com/articles/gordon-ryan-shows-a-simple-bjj-body-triangle-escape/", via: "BJJEE article",
      text: "Against a body triangle on the overhook side, take a thumb-inside grip on their choking wrist; it holds if they go for the strangle." },
    { position: "back", role: "control", topic: "pressure", url: "https://bjjfanatics.com/blogs/news/take-and-control-the-back-like-the-king-gordon-ryan", via: FANATICS_BLOG,
      text: "From straitjacket control, fall to the underhook side so the mat presses on their arm and makes room to trap it with your leg." },
    { position: "mount", role: "control", topic: "body position", url: ryan.mount, via: BJJMORE,
      text: "With both their arms free, don't drop your chest to chase the head; your forward weight is what their escape needs. Stay up, hips high, until you have an arm." },
    { position: "mount", role: "control", topic: "key idea", url: ryan.mount, via: BJJMORE,
      text: "An escape starts with their elbow inside your knee; a submission starts with their elbow above their shoulder. Keep elbows out first, then work one up." },
    { position: "mount", role: "control", topic: "grips", url: ryan.mount, via: BJJMORE,
      text: "When they lock hands on their chest, don't push down into chest and lats. Grip across, same hand to same hand; it's \"embarrassingly easy\" to get the hand to the mat." },
    { position: "mount", role: "control", topic: "key idea", url: ryan.mountGraciemag, via: GRACIEMAG,
      text: "In submission-only, the bottom player shells up: \"Now their goal is not to escape but just not to get submitted.\" So attack deliberately, isolating one limb at a time, instead of waiting for an escape attempt to open something." },
    { position: "mount", role: "control", topic: "body position", url: ryan.mount, via: BJJMORE,
      text: "Get your knees back inside their elbows, up by the armpits. If both elbows are inside your knees, lean, lift one elbow and slide that knee up. An elbow that won't lift has weight on it: switch sides." },
    { position: "mount", role: "control", topic: "mistake", url: ryan.mount, via: BJJMORE,
      text: "Going for the head from three-quarter mount (they've caught your ankle between their legs). It's too late for that: back-step and sit your hips on both their legs, knee to hip, elbow behind the tailbone, then work back to mount." },
    { position: "mount", role: "control", topic: "grips", url: ryan.mount, via: BJJMORE,
      text: "On the cross-wrist grip, keep your palm toward the ceiling. If they strip it, their hand goes out toward the mat instead of back to their chest." },
    { position: "mount", role: "control", topic: "grips", url: ryan.mount, via: BJJMORE,
      text: "Hands locked on the chest: cross grip both wrists and push toward the hand that's underneath; pushing toward the top hand only tightens the lock. If they bridge, pin the hand on the side they bridge to." },
    { position: "mount", role: "control", topic: "key idea", url: ryan.mount, via: BJJMORE,
      text: "Once a hand is pinned, they either reach across to save it (the elbow crosses their chest: go to the back) or clamp that elbow to their side (the underhook goes in). \"One of these two is inevitable.\"" },
    { position: "mount", role: "control", topic: "pressure", url: ryan.mount, via: BJJMORE,
      text: "To get a clamped elbow above the shoulder, move your head, not your fingers: head across to the other side of their chest, then down, up, down. Your arm straightens as your head moves." },
    { position: "mount", role: "control", topic: "key idea", url: ryan.mount, via: BJJMORE,
      text: "\"If I can get her elbows over her shoulder, I'm going to submit her.\" From there it's their reaction that picks the finish: flat, arm triangle; turning away, the back; sitting up into you, triangle or armbar from S-mount." },
    { position: "mount", role: "control", topic: "kuzushi", url: ryan.mount, via: BJJMORE,
      text: "When they bridge over one shoulder, kick out the leg on the other side (the one they drive with), then bring your feet back together. A bigger bridge: a long hook across; bigger still: one knee up, heel on their hip." },
    { position: "mount", role: "control", topic: "grips", url: ryan.mountNewsletter, via: "BJJ Coach newsletter breakdown",
      text: "Aim for palm-up cross grips on both wrists. They have to bridge to save one arm, which makes the other easy to isolate." },
    { position: "mount", role: "escape", topic: "key idea", url: ryan.pins, via: BJJMORE,
      text: "Pick the escape by where their weight is: \"Anytime that my partner is sitting back on my hips, this is not the time for kipping.\" Weight on your hips: knee-elbow. Weight on your head and shoulders: kip. You need to be good at both." },
    { position: "mount", role: "escape", topic: "body position", url: ryan.pins, via: BJJMORE,
      text: "Before you bridge, pull your feet in and turn your toes down: the bridge then holds their weight. A detail he credits to Danaher." },
    { position: "mount", role: "escape", topic: "kuzushi", url: ryan.pins, via: BJJMORE,
      text: "The kip: bridge, they overcorrect, then a sharp knees-to-chest swing lifts them off and your legs come through. \"So I go one bridge, he overcorrects, two kip, three legs.\"" },
    { position: "side-control-top", role: "escape", topic: "body position", url: ryan.pins, via: BJJMORE,
      text: "Under a heavy crossface, turn your face away and bridge: their shoulder slides along your jaw and over your head instead of crushing it, and your knee comes in to meet your elbow." },
    { position: "side-control-top", role: "escape", topic: "distance", url: ryan.pins, via: BJJMORE,
      text: "Let your frames carry their weight: knees and elbows hold them up, not your torso." },
    { position: "side-control-top", role: "escape", topic: "kuzushi", url: ryan.pins, via: BJJMORE,
      text: "As they drive a shin across your hips to mount, bump and curl toward your shoulder so they have to post a hand; that hand is your way back in." },
    { position: "side-control-top", role: "control", topic: "key idea", url: "https://sensobjj.com/blogs/graciemag-1/video-gordon-ryan-explains-the-two-pathways-to-escape-side-control", via: GRACIEMAG,
      text: "There are two ways out: guard recovery with their back on the floor, and wrestling escapes where their back comes off it. You have to shut down both." },
    { position: "side-control-top", role: "escape", topic: "key idea", url: "https://bjjfanatics.com/products/the-pillars-of-defense-pin-escapes-defensive-to-offensive-cycles-by-gordon-ryan", via: FANATICS_PRODUCT,
      text: "Aim for side guard (knee and elbow connected, inside position), then turn the escape into offense: re-guard, leg entries or wrestling." },
    { position: "half-guard-bottom", role: "escape", topic: "key idea", url: "https://bjjfanatics.com/products/systematically-attacking-the-guard-half-guard-passing-by-gordon-ryan", via: FANATICS_PRODUCT,
      text: "Passing half guard: win inside position, get chest to chest, and flatten them out." },
    { position: "open-guard", role: "escape", topic: "key idea", url: "https://bjjfanatics.com/blogs/news/a-new-and-innovative-approach-to-guard-passing-with-gordon-ryan", via: FANATICS_BLOG,
      text: "Three kinds of passing (loose, tight, and passing with submissions) chained together, with the main goal of getting chest to chest." },
    { position: "open-guard", role: "escape", topic: "body position", url: "https://bjjfanatics.com/blogs/news/check-out-gordon-ryans-amazing-passing-system", via: FANATICS_BLOG,
      text: "Loose passing: heavy hands, light legs. If they push your upper body, you beat their legs; if they commit hands to your legs, go tight, chest to chest." },
    { position: "high-knee-shield", role: "escape", topic: "distance", url: "https://bjjcoach.substack.com/p/week-6-gordon-ryans-20-passing-system", via: "BJJ Coach newsletter breakdown",
      text: "Get past their hip line to the J-point and camp there: hand on the hip, push the other leg. They have to carry your weight, and when they move they give up the pass." },
  ],

  [MIKEY]: [
    { position: "collar-sleeve", role: "control", topic: "body position", url: mikey.bullfight, via: FANATICS_BLOG, gi: "gi",
      text: "When they grab inside your knees to bullfight-pass, bring your feet over their arms onto the outside of their shoulders: maximal control of the distance." },
    { position: "collar-sleeve", role: "control", topic: "mistake", url: mikey.killer, via: FANATICS_BLOG, gi: "gi",
      text: "Hooking your feet under their armpits sets up an easy stack pass. A lasso-style foot can be pinned and passed to that side." },
    { position: "collar-sleeve", role: "control", topic: "grips", url: "https://bjjfanatics.com/blogs/news/the-importance-of-guard-and-how-to-defend-it-with-mikey-musumeci", via: FANATICS_BLOG, gi: "gi",
      text: "With feet on the shoulders, take collar and sleeve. The grips are frames that stop them coming forward and hooks that stop them backing away." },
    { position: "collar-sleeve", role: "control", topic: "kuzushi", url: mikey.killer, via: FANATICS_BLOG, gi: "gi",
      text: "Scoot your hips back while holding collar and sleeve so they lean in; all your attacks (triangle, omoplata, armlocks) happen when they lean in." },
    { position: "collar-sleeve", role: "control", topic: "distance", url: mikey.bullfight, via: FANATICS_BLOG, gi: "gi",
      text: "If they walk their feet in to keep posture, their legs are now in reach: switch to a close guard such as De La Riva." },
    { position: "open-guard", role: "control", topic: "key idea", url: mikey.killer, via: FANATICS_BLOG, gi: "gi",
      text: "Against a long-step knee cut, the power comes from the passer's far shoulder, so framing elsewhere is wasted. Collar grip on that shoulder, backed by your foot on it." },
    { position: "open-guard", role: "control", topic: "key idea", url: "https://bjjfanatics.com/blogs/news/advanced-back-take-tips-with-mikey-musumeci", via: FANATICS_BLOG, gi: "gi",
      text: "Keep threatening the back as you retain guard. Passers have to change plans mid-pass, and you funnel them into a few reactions you can sweep or take the back from." },
    { position: "ashi-garami", role: "control", topic: "key idea", url: mikey.minutiae, via: FANATICS_BLOG, gi: "gi",
      text: "In butterfly ashi, read which hip their weight is on. On the far hip, expect a leg drag on your framing leg as they come up." },
    { position: "ashi-garami", role: "control", topic: "body position", url: mikey.minutiae, via: FANATICS_BLOG, gi: "gi",
      text: "If they drag your framing leg they only control its lower half: retract it and rebuild the frame, getting your knee back in front of their shoulder." },
    { position: "ashi-garami", role: "control", topic: "pressure", url: mikey.killer, via: FANATICS_BLOG,
      text: "Straight ankle lock: elbow open, forearm like a blade slicing behind their ankle. If they close the knee, adjust so pressure runs down the line of the leg." },
    { position: "ashi-garami", role: "escape", topic: "body position", url: mikey.killer, via: FANATICS_BLOG,
      text: "When they attack the foot, pull your knee to your chest and push your heel out of their elbow pocket. No socket, no ankle lock." },
    { position: "ashi-garami", role: "control", topic: "key idea", url: "https://bjjfanatics.com/pages/ibjjf-legal-footlocks-by-mikey-musumeci-copy", via: "BJJ Fanatics course page", gi: "gi",
      text: "In a double guard pull, don't stall or pop up: find a leg, control it, and work IBJJF-legal straight ankle locks." },
  ],

  [LEPRI]: [
    { position: "sit-up-guard", role: "control", topic: "key idea", url: lepri.course, via: FANATICS_PRODUCT,
      text: "Treat the sit-up guard as a hub: De La Riva, reverse De La Riva, lasso, shin-to-shin and X guard all feed it, and you pick the one their stance allows." },
    { position: "sit-up-guard", role: "control", topic: "key idea", url: lepri.course, via: FANATICS_PRODUCT,
      text: "Build in a second attack: many of his sequences are a sweep attempt that becomes a single-leg takedown or a back take when they defend the sweep." },
    { position: "sit-up-guard", role: "control", topic: "grips", url: lepri.course, via: FANATICS_PRODUCT, gi: "gi",
      text: "Pair the De La Riva hook with sleeve control (one sleeve, both sleeves, or cross collar and sleeve); the grip you have decides between the ankle trip, overhead sweep, single leg or back take." },
    { position: "sit-up-guard", role: "control", topic: "key idea", url: lepri.review, via: BJJMORE,
      text: "Use De La Riva to wrestle up cleanly: turn seated exchanges into quick single-leg stand-ups without telegraphing them." },
    { position: "sit-up-guard", role: "control", topic: "body position", url: lepri.review, via: BJJMORE,
      text: "His seated game runs on precise grips, angles and timing rather than lapel tricks, the same qualities as his passing." },
  ],

  [NICKY]: [
    { position: "mount", role: "control", topic: "key idea", url: nickyAt(25), via: NICKY_VIA,
      text: "Posture and weight distribution are what stop the common escapes. Fix those before thinking about attacks." },
    { position: "mount", role: "control", topic: "body position", url: nickyAt(86), via: NICKY_VIA,
      text: "Against the knee-elbow escape, keep their head away from their knees. If an elbow gets inside, crossface to turn their head the other way, and they can't shrimp back to guard." },
    { position: "mount", role: "control", topic: "pressure", url: nickyAt(176), via: NICKY_VIA,
      text: "The kip comes when you lean too far forward. Shift your weight back onto their hips, and use a collar tie to anchor your weight and keep their head off the mat: that takes away the power for the lift." },
    { position: "mount", role: "control", topic: "pressure", url: nickyAt(262), via: NICKY_VIA,
      text: "Walking up a tight elbow is a three-step cycle: move your head away, extend your arm to lift the elbow, then sink your weight to lock the new position. Repeat until the elbow is above their head." },
    { position: "mount", role: "control", topic: "key idea", url: nickyAt(451), via: NICKY_VIA,
      text: "A knee-elbow attempt pulls their own elbow away from their ribs. Use that moment to slide your hand in for a deep underhook." },
    { position: "mount", role: "control", topic: "body position", url: nickyAt(528), via: NICKY_VIA,
      text: "For the armbar, slide to S-mount and keep your weight centered. If they lock their hands, stay in S-mount and keep the pressure on before you work on separating the grip." },
    { position: "mount", role: "control", topic: "grips", url: nickyAt(714), via: NICKY_VIA,
      text: "Only one elbow isolated? Secure the wrist, slide your knee high into the armpit and posture up. Lift their head strongly before you step over to lock the mounted triangle." },
    { position: "mount", role: "control", topic: "pressure", url: nickyAt(902), via: NICKY_VIA,
      text: "Arm triangle: get your shoulder deep under the chin. As you dismount to the side, keep your knee wedged against their hip so they can't turtle or turn away from the pressure." },
    { position: "mount", role: "control", topic: "key idea", url: nickyAt(1087), via: NICKY_VIA,
      text: "Expect to chain: switch sides from the S-mount armbar, and go from the arm triangle to the triangle when someone is hard to strangle." },
  ],

  [MARCELO]: [
    { position: "butterfly-guard", role: "control", topic: "key idea", url: "https://www.bjjee.com/articles/be-one-with-the-floor-the-secret-to-marcelo-garcias-butterfly-guard/", via: "Kenny Florian's analysis (BJJEE)",
      text: "Grips matter less than being under them. \"Become the floor\": when they rest on you instead of the mat, they can't post, and sweeps work from almost any grip." },
    { position: "butterfly-guard", role: "control", topic: "kuzushi", url: "https://bjjcoach.substack.com/p/the-hidden-secret-to-marcelo-garcias", via: "BJJ Coach newsletter breakdown",
      text: "Only lie back if you can get under them and become their base. If you can't, stay sitting up and take posts away one at a time with two-on-ones." },
    { position: "butterfly-guard", role: "control", topic: "grips", url: "https://bjjfanatics.com/products/the-complete-butterfly-guard-by-marcelo-garcia", via: FANATICS_PRODUCT,
      text: "Make their elbows the main target: elbow control is how you improve position and set up sweeps." },
    { position: "butterfly-guard", role: "control", topic: "body position", url: "https://bjjmore.com/marcelo-garcia-complete-butterfly-guard/", via: BJJMORE,
      text: "Build from an upright butterfly posture you actively hold, and pair it with underhooks to decide which way you sweep." },
    { position: "butterfly-guard", role: "control", topic: "grips", url: marcelo.kick, via: FANATICS_BLOG,
      text: "No underhook available? Collar tie plus control of their other elbow, then scoot deep underneath to start elevating." },
    { position: "butterfly-guard", role: "control", topic: "kuzushi", url: marcelo.kick, via: FANATICS_BLOG,
      text: "If they catch their balance on one leg after you lift, the window is short before they drop heavy again. Kick out that posted leg immediately, above the knee." },
    { position: "side-control-top", role: "control", topic: "grips", url: marcelo.kick, via: FANATICS_BLOG,
      text: "Coming up from a sweep without an underhook, pummel for it right away. If they keep the space closed, travel toward north-south." },
    { position: "x-guard", role: "control", topic: "body position", url: marcelo.xguard, via: FANATICS_PRODUCT,
      text: "Be directly under their center of gravity so every attack comes from underneath them." },
    { position: "x-guard", role: "control", topic: "key idea", url: marcelo.xguard, via: FANATICS_PRODUCT,
      text: "Keep X-guard dynamic. When they pummel the leg free or back-step, counter it or switch to single-leg X instead of fighting for the original X." },
    { position: "back", role: "control", topic: "grips", url: "https://bjjfanatics.com/blogs/news/the-phenomenal-back-control-of-marcelo-garcia", via: FANATICS_BLOG,
      text: "Grip with all four limbs. Secure the position first, improve your grips, and only then hunt the choke." },
    { position: "north-south", role: "control", topic: "pressure", url: marcelo.ns, via: FANATICS_BLOG,
      text: "The north-south choke is a rear naked choke in reverse: body in a straight line from their head, drop the shoulder, and spend your energy holding position, not squeezing." },
    { position: "north-south", role: "control", topic: "grips", url: marcelo.ns, via: FANATICS_BLOG,
      text: "Clear their hands from the neck first: chest pushes the near arm down, hand pushes the far arm. Once you have the neck, they aren't going anywhere; take your time." },
    { position: "side-control-top", role: "escape", topic: "key idea", url: "https://evolve-mma.com/blog/understanding-sit-up-escapes-in-bjj/", via: "Evolve MMA article",
      text: "Don't accept being flattened: sit up as soon as your legs are passed, frame on the neck or far arm, post the other hand, move the legs away. Above all, don't let them control your head." },
    { position: "front-headlock", role: "control", topic: "grips", url: marcelo.guillotine, via: FANATICS_BLOG,
      text: "Get your forearm under the chin before you snap the head down so they can't tuck it. Grip with no handles to break, and chase the neck until it finishes." },
    { position: "seated-guard", role: "escape", topic: "distance", url: marcelo.guillotine, via: FANATICS_BLOG,
      text: "Keep pushing them away as they try to connect to your leg. They start lunging to close the distance, and the head is there for the guillotine." },
  ],
};

export const SOURCED: Insight[] = Object.entries(RAW).flatMap(([source, list]) =>
  list.map((s, i) => ({
    id: `src:${source.toLowerCase().replace(/\W+/g, "-")}:${i}`,
    position: s.position,
    role: s.role,
    topic: s.topic,
    text: s.text,
    source,
    url: s.url,
    via: s.via,
    ...(s.gi ? { gi: s.gi } : {}),
  })),
);
