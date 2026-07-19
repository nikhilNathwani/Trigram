import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/unit/**/*.test.js"],
		// Pin the timezone so date-based tests (calendar.js) give the same
		// result on every machine/CI runner, regardless of local timezone.
		env: {
			TZ: "UTC",
		},
	},
});
