import { defineConfig } from "astro/config";

// app/js, app/css, app/assets, and the root static files (og-image.png,
// site.webmanifest) are deliberately NOT under src/ or public/ — they stay
// exactly where they are and get copied into dist/ verbatim by the "build"
// npm script's `cp` step, after `astro build` runs. Only the two runtime-
// fetched data files (data/trigram_calendar.json, data/trigram-word-lists/)
// and tools/label/ (the only part of tools/ actually served) are copied —
// not those directories wholesale, since data/ also holds a large gitignored
// corpus/ folder and tools/ holds unrelated Python scripts, one of which
// (tools/scripts/serviceAccount.json) is a credential explicitly gitignored
// as "NEVER commit this." data/ specifically is written to at its current
// path by Python scripts outside this JS/HTML world, so its source location
// never moves either way. See the astro-conversion plan.
export default defineConfig({});
