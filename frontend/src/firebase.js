import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDCmU6jSynDah5F-R9_NS8JUVRslG4woy4",
  authDomain: "cybershield-ai-62822.firebaseapp.com",
  projectId: "cybershield-ai-62822",
  storageBucket: "cybershield-ai-62822.firebasestorage.app",
  messagingSenderId: "484247605687",
  appId: "1:484247605687:web:b1e337e982aba5afef9832",
  measurementId: "G-7TKF2J26MV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();