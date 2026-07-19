import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_JS_DIR = path.resolve(__dirname, "../../../app/js");

/**
 * Loads a production app/js/*.js file the same way the browser does: as a
 * plain classic <script> tag, not an ES/CommonJS module. The app has no
 * build step and no `export` statements — every function is a bare global.
 *
 * `(0, eval)(code)` is "indirect eval": calling eval via a reference instead
 * of the literal identifier forces the JS spec to run the code in global
 * scope instead of the caller's local scope, so top-level `function foo(){}`
 * declarations attach to globalThis exactly like a real <script> tag would.
 *
 * This means tests exercise the exact same file bytes that ship to users —
 * zero source modification required to make this codebase testable.
 */
export function loadAppScript(relativePath) {
	const fullPath = path.join(APP_JS_DIR, relativePath);
	const code = fs.readFileSync(fullPath, "utf8");
	(0, eval)(code);
}
