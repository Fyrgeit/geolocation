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
const db = getFirestore(app);

const locationEl = document.getElementById("location");
const statusEl = document.getElementById("status");
const trackEl = document.getElementById("track");
const uploadEl = document.getElementById("upload");

let track = false;
let upload = false;
let lastTrack;
let trackInterval = 15;

trackEl.onchange = (e) => {
    track = e.target.checked;

    if (track) {
        getLocation();
        updateTimer();
    }
}

uploadEl.onchange = (e) => {
    upload = e.target.checked;
}

function updateTimer() {
    if (!track) {
        statusEl.innerText = "Spårar inte";
        return;
    }
    
    statusEl.innerText = "Senaste spårning: " + Math.floor((Date.now() - lastTrack) / 1000) + " sekunder sedan";

    setTimeout(updateTimer, 1000);
}

function getLocation() {
    if (!track) {
        return;
    }
    
    if (!navigator.geolocation) {
        console.error("Geolocation is not supported by your browser");
    } else {
        setTimeout(getLocation, trackInterval * 1000);

        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const timestamp = position.timestamp.toString().slice(0, -3);
            const str = `${latitude},${longitude},${timestamp}`;

            console.log(str, Date.now() - lastTrack);
            locationEl.innerText = `N${latitude} E${longitude}`;

            if (upload) {
                const månsRef = doc(db, "users", "måns");

                updateDoc(månsRef, {
                    tracks: arrayUnion(str)
                }).then(() => {
                    console.log("Document successfully written!");
                });
            }

            lastTrack = Date.now();
        }, () => {
            console.error("Unable to retrieve your location");
        });
    }
}
