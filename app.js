import { db } from "./firebase.js";
import { doc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const outputEl = document.getElementById("output");
const statusEl = document.getElementById("status");
const startEl = document.getElementById("start");
const endEl = document.getElementById("end");
const uploadEl = document.getElementById("upload");
const downloadEl = document.getElementById("download");

let upload = false;
let lastTrack;
let watchId;

let backlog = [];

startEl.onclick = () => {
    watchId = navigator.geolocation.watchPosition(
        success,
        () => console.error("Unable to retrieve your location"),
        { enableHighAccuracy: true }
    );

    startEl.setAttribute("disabled", "");
    endEl.removeAttribute("disabled");
}

endEl.onclick = () => {
    navigator.geolocation.clearWatch(watchId);

    endEl.setAttribute("disabled", "");
    startEl.removeAttribute("disabled");
}

uploadEl.onchange = (e) => {
    upload = e.target.checked;
}

downloadEl.onclick = exportData;

updateTimer();

function updateTimer() {
    statusEl.innerText = "Senaste spårning: " + Math.floor((Date.now() - lastTrack) / 1000) + " sekunder sedan";

    setTimeout(updateTimer, 1000);
}

async function success(position) {
    const posObj = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        time: position.timestamp
    }


    backlog.push(posObj);
    outputEl.innerText += `To backlog: ${new Date(position.timestamp).toTimeString().split(" ")[0]}, ${position.coords.accuracy}\n`;

    const avgCount = 5;
    if (backlog.length >= avgCount) {
        const str = [
            backlog.reduce((sum, obj) => sum + obj.lat, 0) / avgCount,
            backlog.reduce((sum, obj) => sum + obj.lon, 0) / avgCount,
            Math.floor(backlog.reduce((sum, obj) => sum + obj.time, 0) / avgCount / 1000).toString()
        ].join(",");
        
        backlog.length = 0;
        
        if (upload) {
            const månsRef = doc(db, "users", "måns");

            await updateDoc(månsRef, {
                tracks: arrayUnion(str)
            });

            outputEl.innerText += `Averaged past ${avgCount} backlogs to: "${str}" and uploaded\n`;
        } else {
            outputEl.innerText += `Averaged past ${avgCount} backlogs to: "${str}"\n`;
        }
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