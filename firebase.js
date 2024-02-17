// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzK16GVFZ2CeJ64SUYtyM3efejopksiT0",
    authDomain: "tracker-e16b3.firebaseapp.com",
    projectId: "tracker-e16b3",
    storageBucket: "tracker-e16b3.appspot.com",
    messagingSenderId: "980268821360",
    appId: "1:980268821360:web:3b32d8c3cbd73dce3efdb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);