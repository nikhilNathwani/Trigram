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
	// Serves the repo exactly as Netlify would (plain static files, no
	// build step) and waits for it to respond before any test starts.
	webServer: {
		command: `npx http-server . -p ${PORT} -c-1 --silent`,
		url: `http://localhost:${PORT}/index.html`,
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
	projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
