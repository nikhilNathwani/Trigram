import { defineConfig } from "astro/config";

// public/js and public/assets hold the untouched, dependency-light game
// runtime (native ES modules, no bundler) and static assets — `astro
// build` copies public/ into dist/ verbatim, on its own, no custom script
// needed. (This used to be a hand-rolled app/ folder copied by a `cp` step
// in package.json's "build" script; public/ is the standard Astro
// mechanism for exactly that, so app/ was folded into it.)
//
// The one thing still copied manually, in the "build" npm script: the two
// runtime-fetched data files (data/trigram_calendar.json,
// data/trigram-word-lists/) and tools/label/ (the only part of tools/
// actually served) — not those directories wholesale, since data/ also
// holds a large gitignored corpus/ folder and tools/ holds unrelated
// Python scripts, one of which (tools/scripts/serviceAccount.json) is a
// credential explicitly gitignored as "NEVER commit this." data/
// specifically is written to at its current path by Python scripts outside
// this JS/HTML world, so its source location never moves either way.
export default defineConfig({});
