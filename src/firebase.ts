import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBmuIBCPwhsU1u525KiirngFS_kKRknhUQ",
  authDomain: "ai-studio-applet-webapp-2cdae.firebaseapp.com",
  projectId: "ai-studio-applet-webapp-2cdae",
  storageBucket: "ai-studio-applet-webapp-2cdae.firebasestorage.app",
  messagingSenderId: "307498160667",
  appId: "1:307498160667:web:dac8cf147a8ee08b415ebe"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
