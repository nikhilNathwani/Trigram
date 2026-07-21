// Composition root: game.js dispatches events but doesn't know the UI
// exists, and ui/view.js/ui/stats.js each subscribe independently without
// importing each other — so something has to import all three, which is
// this file's only job. (A prior version only imported ui/view.js,
// relying on it transitively pulling in ui/stats.js — true before an
// event-driven refactor decoupled them, and once untrue, silently
// orphaned ui/stats.js from the module graph: the stats screen rendered
// but nothing ever populated it.)
import "./game.js";
import "./ui/view.js";
import "./ui/stats.js";
