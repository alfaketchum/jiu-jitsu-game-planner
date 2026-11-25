# How positions get updated

Our process: **add sources from practitioners, then update positions.** Every update is versioned and every named insight cites a source.

## Where things live

| File | What it holds |
|---|---|
| `src/sources.ts` | The source registry: one entry per instructional, review, article or video (practitioner, title, publisher, link, kind, date read, status). |
| `src/sourced.ts` | Practitioner insights. Each one points to a source id, and to a timestamp (`at`, seconds) when the source is a video. |
| `src/positions.ts` | Each position's general content: summary, Control and Escapes (common coaching), techniques. |
| `src/data/changelog.json` | Each position's version history: version, date, summary, sources used, content fingerprint. |

## The steps

1. **Add the source** to `src/sources.ts` before using it. Read it first; record the date you read it in `accessed`.
   - `status: "verified"` when the insight was checked against the page or video.
   - `status: "pending"` for an attribution that hasn't been checked yet. The app labels these "source pending".
   - Pick the honest `kind`: `course` (official chapter list), `review` (independent write-up of a course), `article`, `video`, `video write-up`, `book`.
2. **Add or edit insights.** Practitioner insights go in `src/sourced.ts` with the source id. If an insight is about one technique from one position (the arm triangle from side control, not the arm triangle in general), add `technique: "<exact technique name on that position>"`: then `role: "control"` means doing it and `role: "escape"` means defending it. Add the technique to the position first if it isn't there. General coaching goes in `src/positions.ts`. Paraphrase in plain coaching language; only quote what the source says word for word.
3. **Log the update** for each position you changed:
   ```bash
   npm run log -- mount "Added Nicky Ryan's mount insights" nicky-ryan:no-gi-mount-masterclass
   ```
   This appends the next version with today's date, the sources and a fingerprint of the position's content. It refuses unknown source ids, and refuses to log a position that hasn't changed.
4. **Check:** `npm test`. It fails if:
   - a position changed without a changelog entry (`npm run log:status` lists which),
   - an insight or changelog entry cites a source that isn't in the registry,
   - a named built-in insight has no source id,
   - versions or dates are out of order.
5. **Commit and push**, one position update per commit where practical:
   ```
   mount: add Nicky Ryan's mount insights (v4)
   ```
   CI runs the same tests on every push, and GitHub Pages redeploys.

## Versions

- The changelog is the readable history; git is the full diff history underneath it. Each position page shows its current version and date, and a History panel listing every version with its sources.
- Entries marked `backfilled` were reconstructed from git history when versioning was introduced (25 Nov 2026), not logged at the time.

## Open items

Seven sources are `pending`: attributions written from general knowledge before sourcing was required (John Danaher, Bernardo Faria, Lucas Leite, Eddie Bravo, Marcelo Garcia, Roger Gracie, and Saulo Ribeiro's *Jiu-Jitsu University*). Replace each with a checked source, or remove the attribution.
