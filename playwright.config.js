import { defineConfig, devices } from "@playwright/test";

const PORT = 4300;

export default defineConfig({
	testDir: "./tests/e2e",
	fullyParallel: true,
	reporter: "list",
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: "on-first-retry",
	},
	// Builds the Astro site (astro-conversion spike — see the plan) into
	// dist/, exactly what Netlify would publish, then serves that and waits
	// for it to respond before any test starts.
	webServer: {
		command: `npm run build && npx http-server dist -p ${PORT} -c-1 --silent`,
		url: `http://localhost:${PORT}/index.html`,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
