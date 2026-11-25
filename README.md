# Jiu Jitsu Game Planner

Map your jiu jitsu game as a graph of **positions** and the **techniques** that connect them, then see the chains it produces and the holes in it.

- **Positions** — grouped by neutral / top / bottom, with your notes on grips and priorities.
- **Techniques** — takedowns, passes, sweeps, submissions, transitions and escapes. Each one has a *trigger* (the reaction that tells you to use it), the position it lands you in, and a priority: **A-game**, **B-game** or **Learning**.
- **Chains** — from any position, the tree of what you do next, filtered by priority and depth, stopping at finishes and loops.
- **Gaps** — what your plan is missing: dead-end positions, bottom positions with no sweep or escape, positions with no path to a submission, single-option positions, and positions you can't reach from your starting point.
- **Library**: a position-by-position notebook. Every position has two sides:
  - **Control** (attacking side): what the person holding it does. For a guard that's the guard player; for a pin it's the top player.
  - **Escapes** (defending side): what the person stuck in it does. For a guard that's the passer; for a pin it's the bottom player.

  Insights are grouped by topic (key idea, grips, body position, pressure, distance, off-balance, mistake) and tagged with the practitioner they come from. Filter by practitioner, add your own insights with a source, add your own positions, and export/import your notes.

  Built in (sub-guards nested under their parent):
  - **Closed guard**
  - **Half guard**: high knee shield, low knee shield, deep half, half butterfly (coyote), lockdown, reverse half, inverted half
  - **Spider & lasso** (gi only): spider, lasso, spider + shin-to-shin
  - **De La Riva**: DLR, spider–DLR, DLR–lasso
  - **Seated & butterfly**: seated, sit-up, butterfly
  - **X-guards**: X-guard, single-leg X
  - **Leg entanglements** (Danaher's names): ashi garami, outside ashi garami, inside sankaku, 50/50, with a rules note on heel hooks and reaping
  - **Pins**: side control, mount, north-south (with their judo names)
  - **Back control**

  A **Both / Gi / No-gi** switch in the header filters positions, insights and techniques; gi-only positions carry a chip. Plan positions that match the library show the insights inline, with your side first (e.g. "Side control (bottom)" leads with the escapes).
- Multiple plans (gi, no-gi, a specific opponent), saved in your browser. Export/import as JSON to back up or share with a coach or teammate.

A sample closed-guard game loads on first open.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests for chain building and gap analysis
npm run build    # static site in dist/
```

The build is a static site (relative paths), so it can be hosted on GitHub Pages or opened from any static host.

## Data

Plans are stored in `localStorage` in the browser you use. Clearing site data deletes them, so export plans you care about.

The plan format is plain JSON; see `src/model.ts` for the types.
