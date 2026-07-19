import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vite is used here purely as a JS bundler for app/js — not in its usual
// "app" mode (index.html as entry, dev server, HMR). That mode would require
// consolidating every static asset this site serves (data/, tools/label/,
// site.webmanifest, og-image.png, app/assets/) into a single directory Vite
// owns, which would also mean updating the several Python scripts (see
// tools/) that write directly into data/ at its current path. Scoping Vite
// to just app/js avoids all of that: index.html, data/, tools/label/, and
// Netlify's publish settings are untouched. The trade-off is no dev-server/
// hot-reload — use `npm run build:watch` and manually refresh instead.
export default defineConfig({
	publicDir: false,
	build: {
		outDir: "app/dist",
		emptyOutDir: true,
		rollupOptions: {
			input: resolve(__dirname, "app/js/game.js"),
			output: {
				format: "iife",
				name: "TrigramApp",
				entryFileNames: "bundle.js",
			},
		},
	},
});
