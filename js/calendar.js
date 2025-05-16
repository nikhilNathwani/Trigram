// Trigrams in the order they'll be used in games
// -use gameID to index into this array for current trigram
const trigrams = [
	"IST",
	"REA",
	"PLE",
	"MON",
	"UNI",
	"ENT",
	"ALL",
	"EVI",
	"TOU",
	"AND",
	"NER",
	"OSE",
	"LAM",
	"ISC",
	"ERE",
	"UMP",
	"TAB",
	"ICK",
	"MEA",
	"ROO",
	"UES",
	"SPA",
	"INF",
	"CED",
	"TRA",
	"ATO",
	"EMP",
	"ION",
	"CRU",
	"FEA",
	"EXT",
	"MOR",
	"HIS",
	"ABL",
	"SEN",
	"ROA",
	"TAM",
	"CUS",
	"NCH",
	"EDE",
	"GAL",
	"BRO",
	"KIN",
	"OUS",
	"SPE",
	"DLY",
	"PAR",
	"QUI",
	"LOG",
	"VES",
	"FAC",
	"BIL",
	"GUL",
	"CEN",
	"WOR",
	"NAP",
	"RIM",
	"THE", //current
];

// Returns 0-indexed game ID (to index into trigram list)
function getGameID() {
	if (DEBUG.forceFakePastStats) {
		return fakeCurrentGameID;
	}

	// Start date of the first game
	const gameStartDate = new Date("2024-04-15");

	// Time since gameStartDate in milliseconds
	const currentDate = new Date();
	const timeZoneOffset = currentDate.getTimezoneOffset() * 60 * 1000;
	const timeDifference =
		currentDate.getTime() - timeZoneOffset - gameStartDate.getTime();

	// Convert milliseconds to weeks
	const millisecondsInWeek = 7 * 24 * 60 * 60 * 1000; // Milliseconds in a week
	var weeksDifference = Math.floor(timeDifference / millisecondsInWeek);

	return weeksDifference;
}

// Returns 1-indexed game ID with 3 digits (prepended with 0s if needed)
function getGameIDString() {
	var numStr = (getGameID() + 1).toString();
	numStr = numStr.length > 3 ? numStr : numStr.padStart(3, "0");
	return numStr;
}

// Returns "Week of <month abbrev> <date>, <year>"
function getWeekString() {
	const currentDate = new Date();
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) through 6 (Saturday)
	const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek; // Offset to Monday
	const mondayDate = new Date(currentDate);
	mondayDate.setDate(currentDate.getDate() + mondayOffset);
	const month = months[mondayDate.getMonth()];
	const day = mondayDate.getDate();
	const year = mondayDate.getFullYear();
	return `Week of ${month.slice(0, 3)} ${day}, ${year}`;
}

function getNextMondayString() {
	const currentDate = new Date();
	const currentDayOfWeek = currentDate.getDay(); // 0 (Sunday) through 6 (Saturday)
	const daysUntilNextMonday =
		currentDayOfWeek === 1 ? 7 : (8 - currentDayOfWeek) % 7; // Calculate days until next Monday
	const nextMonday = new Date(currentDate);
	nextMonday.setDate(nextMonday.getDate() + daysUntilNextMonday); // Set to next Monday

	// Format the date as "MMM DD"
	const options = { month: "short", day: "2-digit" };
	const formattedDate = nextMonday.toLocaleDateString("en-US", options);
	return formattedDate;
}
