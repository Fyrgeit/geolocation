import { db } from "./firebase.js";
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const locationEl = document.getElementById("location");
const statusEl = document.getElementById("status");
const trackEl = document.getElementById("track");
const uploadEl = document.getElementById("upload");
const downloadEl = document.getElementById("download");

let track = false;
let upload = false;
let lastTrack;
let trackInterval = 15;
let watchId;

trackEl.onchange = (e) => {
    track = e.target.checked;

    if (track) {
        watchId = navigator.geolocation.watchPosition(
            success,
            () => console.error("Unable to retrieve your location"),
            { timeout: 10000, enableHighAccuracy: true }
        );

        updateTimer();
    } else {
        navigator.geolocation.clearWatch(watchId);
    }
}

uploadEl.onchange = (e) => {
    upload = e.target.checked;
}

downloadEl.onclick = exportData;

function updateTimer() {
    if (!track) {
        statusEl.innerText = "Spårar inte";
        return;
    }

    statusEl.innerText = "Senaste spårning: " + Math.floor((Date.now() - lastTrack) / 1000) + " sekunder sedan";

    setTimeout(updateTimer, 1000);
}

async function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const timestamp = position.timestamp.toString().slice(0, -3);
    const str = `${latitude},${longitude},${timestamp}`;

    console.log(position.coords, Date.now() - lastTrack);
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
}

async function exportData() {
    const response = await getDoc(doc(db, "users", "måns"));
    const data = await response.data();
    const coords = data.tracks.map(t => ({
        lat: Number(t.split(",")[0]),
        lon: Number(t.split(",")[1]),
        time: new Date(t.split(",")[2] * 1000)
    }));

    let geoJson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: coords.map(c => ([c.lon, c.lat])),
                    type: "LineString"
                }
            }
        ]
    };

    /* 
    let geoJson = {
        type: "FeatureCollection",
        features: coords.map(c => ({
            {
                type: "Feature",
                properties: {},
                geometry: {
                    coordinates: [c.lon, c.lat],
                    type: "Point"
                }
            }
        }))
    }; */

    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(geoJson)], { type: "text/json" });
    a.href = URL.createObjectURL(file);
    a.download = "tracks.json";
    a.click();
}