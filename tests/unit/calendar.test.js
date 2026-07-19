import { afterEach, describe, expect, it, vi } from "vitest";
import {
	getGameID,
	getGameIDString,
	getNextMondayString,
	getWeekString,
} from "../../app/js/calendar.js";

// calendar.js turns "today's date" into a puzzle number, which is the one
// piece of this app's logic that's inherently about time. Time-based code is
// notoriously flaky to test if you let it read the real clock — instead we
// pin the clock with Vitest's fake timers (vi.setSystemTime), so every test
// run produces the exact same result regardless of when/where it's run.
//
// vitest.config.js also pins TZ=UTC for this same reason: getGameID() calls
// Date.getTimezoneOffset(), and without a fixed timezone this test's
// expected values would shift depending on the machine running them.
//
// calendar.js imports DEBUG from debug.js (a real, two-way circular import —
// see the comment at the top of app/js/game.js). We don't need to mock it:
// debug.js's DEBUG.forceFakePastStats defaults to false, which is exactly
// the branch these tests want to exercise (real date-based game IDs).
describe("calendar", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	describe("getGameID", () => {
		it("is 0 on the game's launch date", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-15T00:00:00Z"));
			expect(getGameID()).toBe(0);
		});

		it("stays 0 for the rest of the first week", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-21T23:59:59Z"));
			expect(getGameID()).toBe(0);
		});

		it("advances to 1 exactly one week after launch", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-22T00:00:00Z"));
			expect(getGameID()).toBe(1);
		});

		it("advances by one for every full week that passes", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-06-10T00:00:00Z")); // 8 weeks after launch
			expect(getGameID()).toBe(8);
		});
	});

	describe("getGameIDString", () => {
		it("zero-pads to 3 digits", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-15T00:00:00Z")); // gameID 0
			expect(getGameIDString()).toBe("001");
		});

		it("does not truncate once the game count reaches 4 digits", () => {
			vi.useFakeTimers();
			// gameStartDate + 999 weeks -> gameID 999 -> displayed as "1000"
			vi.setSystemTime(new Date("2024-04-15T00:00:00Z"));
			const nineHundredNinetyNineWeeksLater = new Date(
				new Date("2024-04-15T00:00:00Z").getTime() +
					999 * 7 * 24 * 60 * 60 * 1000
			);
			vi.setSystemTime(nineHundredNinetyNineWeeksLater);
			expect(getGameIDString()).toBe("1000");
		});
	});

	describe("getWeekString", () => {
		it("reports the Monday of the current week", () => {
			// Wednesday, April 17 2024 -> week of Monday April 15
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-17T12:00:00Z"));
			expect(getWeekString()).toBe("Week of Apr 15, 2024");
		});

		it("rolls over correctly when today is a Sunday", () => {
			// Sunday, April 21 2024 belongs to the week starting Monday April 15
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-21T12:00:00Z"));
			expect(getWeekString()).toBe("Week of Apr 15, 2024");
		});
	});

	describe("getNextMondayString", () => {
		it("returns the following Monday when today is itself a Monday", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-15T12:00:00Z")); // a Monday
			expect(getNextMondayString()).toBe("Apr 22");
		});

		it("returns this week's upcoming Monday on a mid-week day", () => {
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2024-04-17T12:00:00Z")); // a Wednesday
			expect(getNextMondayString()).toBe("Apr 22");
		});
	});
});
