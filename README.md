# Jiu Jitsu Game Planner

Map your jiu jitsu game as a graph of **positions** and the **techniques** that connect them, then see the chains it produces and the holes in it.

- **Positions** — grouped by neutral / top / bottom, with your notes on grips and priorities.
- **Techniques** — takedowns, passes, sweeps, submissions, transitions and escapes. Each one has a *trigger* (the reaction that tells you to use it), the position it lands you in, and a priority: **A-game**, **B-game** or **Learning**.
- **Chains** — from any position, the tree of what you do next, filtered by priority and depth, stopping at finishes and loops.
- **Gaps** — what your plan is missing: dead-end positions, bottom positions with no sweep or escape, positions with no path to a submission, single-option positions, and positions you can't reach from your starting point.
- **Library** — positional insights for closed guard, spider guard, half guard and butterfly guard (bottom), and side control, mount and north-south (top): goals, grips, principles, common mistakes, how the opponent will try to pass or escape with your answer, and suggested techniques with triggers. Add a whole position or single techniques to your plan in one click; positions in your plan that match the library show the insights inline.
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
