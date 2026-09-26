import { firebaseConfig, AUTHORIZED_UID } from "/tools/label/firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
	getAuth,
	GoogleAuthProvider,
	onAuthStateChanged,
	signInWithPopup,
	signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Shared by the label queue (app.js) and Browse (browse.js). Firestore rules
// (tools/label/firestore.rules) only let AUTHORIZED_UID read or write, so every
// Firestore call must wait for requireSignIn(). Firebase persists the session,
// so after the first sign-in on a device this resolves without any UI.

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const auth = getAuth(app);

export function requireSignIn() {
	return new Promise((resolve) => {
		const stop = onAuthStateChanged(auth, async (user) => {
			if (user && user.uid === AUTHORIZED_UID) {
				stop();
				document.getElementById("auth-screen")?.remove();
				resolve(user);
				return;
			}
			if (user) {
				// Signed in with some other Google account: don't keep that session.
				const email = user.email;
				await signOut(auth);
				showSignIn(`${email} isn’t authorized. Sign in with the admin account.`);
				return;
			}
			showSignIn("");
		});
	});
}

// signInWithPopup must run inside a click handler, or browsers block the popup.
function showSignIn(message) {
	let screen = document.getElementById("auth-screen");
	if (!screen) {
		screen = document.createElement("div");
		screen.id = "auth-screen";
		screen.innerHTML =
			'<div class="auth-card"><h1>Trigram Admin</h1>' +
			'<p class="auth-subtitle">Sign in to view and edit labels.</p>' +
			'<button id="sign-in-btn" type="button">Sign in with Google</button>' +
			'<p id="auth-error"></p></div>';
		document.body.appendChild(screen);
		screen.querySelector("#sign-in-btn").addEventListener("click", async () => {
			try {
				await signInWithPopup(auth, new GoogleAuthProvider());
			} catch (err) {
				if (err.code !== "auth/popup-closed-by-user") {
					screen.querySelector("#auth-error").textContent = err.message;
				}
			}
		});
	}
	screen.querySelector("#auth-error").textContent = message;
}
