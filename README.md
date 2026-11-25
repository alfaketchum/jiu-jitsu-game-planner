# Jiu Jitsu Game Planner

A position-by-position notebook for jiu jitsu. Every position has two sides:

- **Control** (attacking side): what the person holding it does. For a guard that's the guard player; for a pin it's the top player; for a leg entanglement it's the attacker.
- **Escapes** (defending side): what the person stuck in it does. For a guard that's the passer; for a pin it's the bottom player.

Insights are grouped by topic: key idea, grips, body position, pressure, distance, kuzushi, mistakes.

Under each position, **From practitioners** lists named people with their own control and escape insights, each linked to its source (Marcelo Garcia, Craig Jones, Gordon Ryan, Mikey Musumeci, Jozef Chen, Lucas Lepri, and others). Filter by practitioner in the sidebar. Add your own insights, with a source if you have one, and your own positions or sub-guards; export and import your notes as JSON.

Each position also lists its **techniques**, grouped into sweeps, submissions, transitions and takedowns, with the position each one lands in. A submission that also appears on other positions (kimura from closed guard, half guard, side control, north-south) links to its variants; sweeps stay with the guards they belong to.

A **Both / Gi / No-gi** switch filters positions, insights and techniques; gi-only positions carry a chip.

## Positions

Sub-guards are nested under their parent.

- **Open guard**: collar-sleeve
- **Closed guard**
- **Half guard**: high knee shield, low knee shield (Z-guard), deep half, half butterfly, lockdown, reverse half, inverted half
- **Spider & lasso** (gi only): spider, lasso, spider + shin-to-shin
- **De La Riva**: DLR, spider–DLR, DLR–lasso
- **Seated & butterfly**: seated (shin-to-shin), sit-up (Lucas Lepri), butterfly
- **X-guards**: X-guard, single-leg X
- **Leg entanglements** (Danaher's names): ashi garami, outside ashi garami, inside sankaku, 50/50
- **Pins**: side control, mount, north-south
- **Back control**
- **Turtle**: front headlock

## Use it online

Deployed to GitHub Pages on every push to `main`: https://alfaketchum.github.io/jiu-jitsu-game-planner/
(One-time setup: repo **Settings → Pages → Source: GitHub Actions**.)

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test
npm run build    # static site in dist/
```

## Updating positions

Add sources first, then update positions, then log the update. Every position is versioned and every named insight cites a source. See **[PROCESS.md](PROCESS.md)**.

## Data

Position content lives in `src/positions.ts`, practitioner insights in `src/sourced.ts`, the source registry in `src/sources.ts`, and each position's version history in `src/data/changelog.json`. Your own notes are stored in `localStorage` in the browser you use; clearing site data deletes them, so export what you care about.
