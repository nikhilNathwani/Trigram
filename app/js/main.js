// Composition root. game.js (the Model) doesn't know the UI exists — it only
// dispatches on its own gameEvents target. ui/view.js (which transitively
// pulls in ui/modal.js and interactionHandler.js) and ui/stats.js are each
// independent subscribers — neither imports the other, or game.js, for the
// purpose of being loaded. Something has to import all of them; that's this
// file's only job. (A prior version of this file only imported ui/view.js,
// on the mistaken belief that it still transitively pulled in ui/stats.js —
// it did, before the event-driven refactor decoupled stats.js from view.js.
// That silently orphaned ui/stats.js from the module graph entirely: the
// stats screen rendered, but nothing ever populated it, since its
// gameEvents.addEventListener(...) calls never got a chance to run.)
import "./game.js";
import "./ui/view.js";
import "./ui/stats.js";
