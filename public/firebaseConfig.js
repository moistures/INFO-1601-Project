// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAt830YDt_Zry_6v6pfy6dikAAn1UvXKmU",
  authDomain: "info-1601-project-kerasene.firebaseapp.com",
  projectId: "info-1601-project-kerasene",
  storageBucket: "info-1601-project-kerasene.appspot.com",
  messagingSenderId: "1039891082888",
  appId: "1:1039891082888:web:e4fccb8a7147b07182793d",
  measurementId: "G-KMPS6Z438W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = firebase.auth();

export default firebaseConfig;

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  signOut, 
  signInAnonymously, 
  setPersistence, 
  browserLocalPersistence, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import firebaseConfig from "./firebaseConfig.js";

function setAuthListeners(onLogin){
  onAuthStateChanged(auth, user => {
    if (user) {
      onLogin();
    } 
  });
}

async function signIn(){
  try{
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInAnonymously(auth);
    return userCredential.user; 
  } catch(e) {
    console.error(e);
    return null; 
  }
}

async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out', error);
  }
}


export {auth, setAuthListeners, signIn, logout};