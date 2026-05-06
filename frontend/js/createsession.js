import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");
/* errorBox:
viser fejltekst i en popup box der forsvinder af sig selv */

/* document:
Vælger classes .createPrivate og .createShared
Tilføjer event listener click og kalder funktior ved klik
*/
document
    .querySelector('.createPrivate')
    .addEventListener('click', createPrivateSession);
document
    .querySelector('.createShared')
    .addEventListener('click', createSharedSession);

/*Funktionerne følger her et api i stedet for 2 i 1 funktion. 
Både create private session og shared session kalder samme funktion*/
async function createPrivateSession() {
  await createSession("/api/sessions/private");
}
async function createSharedSession() {
  await createSession("/api/sessions/shared");
}

/* 
De 2 funktioner ovenover kalder begge createSession, som er den funktion der håndterer det asynkrone fetch kald og redirect. Den tager endpoint som argument, så den kan bruges til både private og shared session.
Vi afventer api kald fra server.js. 
default fetch metode er 'GET', så her definerer vi method: 'POST'.

API svarer med et JSON: {"session_id": x}. 
Denne ordbog gemmes i variablen const currentSession.
Vi skal redirect klienten via det.
Funktionerne laver derfor et link path med session_id ved at slå op i ordbogen, */
async function createSession(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: "POST",
        });
        if (!response.ok) {
            console.log("error")
            showError("Error: Cannot create new session");
            return;
        }
        const currentSession = await response.json();
        localStorage.setItem("session_id", currentSession.session_id);
        localStorage.setItem("is_private", currentSession.is_private);
/* localStorage.setItem:
Gemmer session_id i browseren, så andre sider kan vide hvilken session brugeren er i.
localStorage er et JavaScript Web API, der gør det muligt at gemme data lokalt i brugerens browser. 
Data bevares, selv efter browseren lukkes eller genstartes, og gemmes uden udløbsdato. 
Det bruges ofte til at huske brugerpræferencer (som fx "dark mode"), indkøbskurve el.lign.*/
        console.log("Response: " + response.status + "!"+ " Session created with Session Id: " + currentSession.session_id)
/* Hvis join lykkes, skal bruger linkes videre til sin unikke udgave af "mainpage.html".
window.location.href = `/session/${currentSession.session_id}`; */
  
    } catch (error) {
    console.error(error);
    showError("An error occured during the creation of session");
    }
}