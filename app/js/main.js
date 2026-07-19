// Composition root. game.js (the Model) doesn't know the UI exists — it only
// dispatches on its own gameEvents target. ui/view.js (which transitively
// pulls in ui/stats.js, ui/modal.js, and interactionHandler.js) is the side
// that subscribes. Something has to load both, since neither imports the
// other purely for that purpose; that's this file's only job.
import "./game.js";
import "./ui/view.js";
