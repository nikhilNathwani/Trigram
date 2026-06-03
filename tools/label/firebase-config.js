// Firebase project configuration
// Get this from: Firebase Console → Project Settings → Your apps → Web app config
//
// Steps to fill this in:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (or use existing)
//   3. Enable Firestore (Native mode) and Google Authentication
//   4. Project Settings → Your apps → Add web app → copy the config below
//   5. Replace all REPLACE_WITH_... placeholders
//
// AUTHORIZED_UID: your personal Google account UID
//   - First deploy with AUTHORIZED_UID = "" (leave blank)
//   - Sign in to the app → you'll see your UID in the error message
//   - Paste it here and redeploy

export const firebaseConfig = {
	apiKey: "AIzaSyBw1gd6f_p80kDErI6NnIRy6Ma8zaGoNPY",
	authDomain: "trigram-labels.firebaseapp.com",
	projectId: "trigram-labels",
	storageBucket: "trigram-labels.firebasestorage.app",
	messagingSenderId: "778177125352",
	appId: "1:778177125352:web:80707b2d0396874b70225d",
};

// Your Google account UID — paste after first sign-in attempt
export const AUTHORIZED_UID = "";
