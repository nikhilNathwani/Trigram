// Single source of truth for level/round sizing — imported by game.js,
// ui/view.js, interactionHandler.js, and ui/generateBoard.js, so none of
// them can drift out of sync with each other.
export const WORD_LENGTH_START = 4;
export const WORD_LENGTH_MAX = 15;
export const LEVELS_PER_ROUND = 3;
export const LEVELS_TOTAL = WORD_LENGTH_MAX - WORD_LENGTH_START + 1;
// Levels completed when round 3 ends and the You Win screen (with its
// bonus-round offer) should show, i.e. one round short of the total.
export const PRE_BONUS_LEVELS_COMPLETE = LEVELS_TOTAL - LEVELS_PER_ROUND;
