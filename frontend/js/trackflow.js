/* TRACK FLOW = AFSPILNINGSKØEN
Håndterer alt der har med queue at gøre, 
både at hente den fra databasen og at vise den i mainpage menuen 
*/

/* ERROR BOX: 
viser fejltekst i en popup box der forsvinder af sig selv
Kald blot funktionen showError("") og boksen vises med tekst i */
import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");

/* addTrackToVotes funktion fra ./mainpage, så vi kan bruge samme funktion til vote button */
import { addTrackToVotes } from "./mainpage.js";

document.addEventListener("DOMContentLoaded", renderQueue);

/* SHOW/HIDE BUTTON TIL TRACKFLOW QUEUE */
const trackFlowBox = document.querySelector(".trackFlowBox")
const queueBtn = document.querySelector(".songQueueBtn");
const queueBtnIconOpenClose = document.querySelector(".songQueueIconOpenClose")
const queueBtnIcon = document.querySelector(".songQueueIcon")
queueBtn.addEventListener("click", async function () {
  if (trackFlowBox.classList.contains("open")) {
    trackFlowBox.classList.remove("open");
    queueBtnIconOpenClose.src = "images/arrow_left_menu.png";
    queueBtnIconOpenClose.style = "right: 22px";
    queueBtnIcon.style = "right: 2px";
  } else {
    await renderQueue();

    trackFlowBox.classList.add("open");
    queueBtnIconOpenClose.src = "images/arrow_right_menu.png";
    queueBtnIconOpenClose.style = "right: -4px";
    queueBtnIcon.style = "right: 16px";
  }
/* man kunne også bruge ".toggle" her: 
".toggle" tilføjer klassen hvis den ikke findes og fjerner den, hvis den findes*/
});


/* Viser queue-listen i mainpage - TrackFlow-boxen */
async function renderQueue() {
  const trackFlowList = document.getElementById("trackFlowList");

  if (!trackFlowList) {
    return;
  }

  const queue = await getSessionQueue();

  trackFlowList.innerHTML = "";

  /* hvis sesion queue er tom, vises en besked */
  if (queue.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "trackFlow";
    emptyMessage.textContent = "Flow has yet to be started...";
    trackFlowList.appendChild(emptyMessage);
    return;
  }
/* for hver track indlæst, render vi en række med tekst og vote knap */
  queue.forEach(function(track, index) {
    const li = document.createElement("li");
          li.className = "trackFlowRow";
          li.textContent = `${index + 1}. ${track.track_title || "Unknown track"} - ${track.artist || "Unknown artist"} - (${track.vote_count || "Unknown amount of"} votes) `;
    const voteButton = document.createElement("button");
          voteButton.className = "voteBtn CircleBtn";
          voteButton.innerHTML = `<img src="images/vote_button.png" class="centerBtnImg">`;
          voteButton.addEventListener("click", function() {
            addTrackToVotes(track);
          });
    li.appendChild(voteButton);
    trackFlowList.appendChild(li);
  });
}


/* Funktion til at holde køen i gang. 
  Hvis der er 0 sange i køen, inviteres brugeren til at vælge: 
  ét mood eller alle moods, som playlisten holder sig selv kørende med 
  sangene genereres med 0 votes, da de oprettes i db med i 
  tabel sessions_tracks, i kolonne added_by_system, med værdi true. 
  Derfor tæller system genererede votes 0*/
async function secureTrackFlow() {
  const queue = await getSessionQueue();

  if (queue.length > 0) {
    return;
  } else {
    // vis knapper/popup til at render random tracks
  }
}


/* Henter queue-listen fra databasen til vores TrackFlow box */
async function getSessionQueue() {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    console.log("No session_id found. Cannot load queue.");
    return [];
    showError("No session ID found. Cannot load content for TrackFlow.");
  }
  const response = await fetch(`/api/sessions/${sessionId}/queue`);
  if (!response.ok) {
    console.log("Could not fetch queue from database.");
    return [];
  }
  const trackFlow = await response.json();
  console.log("loaded tracks for current seession id", sessionId, "--- tracks:", trackFlow);
  return trackFlow;
}


let currentSessionId
/* Finder den session brugeren er i via localStorage */
function getCurrentSessionId() {
  currentSessionId = localStorage.getItem("session_id");
  return currentSessionId;
}
