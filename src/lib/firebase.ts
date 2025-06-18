
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuecagQyrD_4XeFKNit13huz-jTszUPXY",
  authDomain: "craftflow-kqpxv.firebaseapp.com",
  projectId: "craftflow-kqpxv",
  storageBucket: "craftflow-kqpxv.firebasestorage.app",
  messagingSenderId: "690294354694",
  appId: "1:690294354694:web:0f2cf29e7880ba5912e487"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth: Auth = getAuth(app);

export { app, auth };
