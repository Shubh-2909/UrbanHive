
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyAv_jpw84WawgPswN0seyWwuQt2mUUvRcw",
  authDomain: "ecommerce-263e0.firebaseapp.com",
  projectId: "ecommerce-263e0",
  storageBucket: "ecommerce-263e0.appspot.com",
  messagingSenderId: "951650321184",
  appId: "1:951650321184:web:592ded37e17b4a5a380d45",
  measurementId: "G-WLY1GSH9EH"
};


export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);