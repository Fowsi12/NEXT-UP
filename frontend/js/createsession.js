/* document:
Vi vælger classes .createPrivate og .createShared
Vi tilføjer event listener click og kalder funktion ved klik
*/
document
    .querySelector('.createPrivate')
    .addEventListener('click', createPrivateSession);

document
    .querySelector('.createShared')
    .addEventListener('click', createSharedSession);

/* Create Private/Shared Session funktioner:

*/

/*
async function createPrivateSession() {
  const response = await fetch('/api/sessions/private', {
    method: 'POST',
  });

  if (response.ok) {
    const currentSession = await response.json();
    console.log("Response: " + response.status + "!"+" Private Session created with Session Id: " + currentSession);
    window.location.href = `/session/${currentSession.session_id}`;
  }
}

async function createSharedSession() {
  const response = await fetch('/api/sessions/shared    ', {
    method: 'POST',
  });

  if (response.ok) {
    const currentSession = await response.json();
    console.log("Response: " + response.status + "!"+" Shared Session created with Session Id: " + currentSession);
    window.location.href = `/session/${currentSession.session_id}`;
  }
}
*/

//Funktion følger nu én api istedet for 2 i 1 funktion. Det her er create private session, [næste linje]
async function createPrivateSession() {
  await createSession("/api/sessions/private");
}

//[sætningen fortsætter fra ovenover] og create shared session kalder samme funktion.
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
  const message = document.getElementById("createSessionMessage");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
    });

    if (!response.ok) {
      message.textContent = "Kunne ikke oprette session.";
      return;
    }

    const currentSession = await response.json();

/*
localStorage er et JavaScript Web API, der gør det muligt at gemme data lokalt i brugerens browser. 
Data bevares, selv efter browseren lukkes eller genstartes, og gemmes uden udløbsdato. 
Det bruges ofte til at huske brugerpræferencer (som "dark mode"), indkøbskurve eller "huske mig"-funktioner
*/
    localStorage.setItem("session_id", currentSession.session_id);
    localStorage.setItem("is_private", currentSession.is_private);
// Gemmer session_id i browseren, så andre sider kan vide hvilken session brugeren er i.

    console.log("Response: " + response.status + "!"+ " Session created with Session Id: " + currentSession.session_id)
  // Hvis join lykkes, sendes brugeren videre til hovedsiden "mainpage.html".
  //  window.location.href = `/session/${currentSession.session_id}`;
  
  } catch (error) {
    console.error(error);
    message.textContent = "Der skete en fejl ved oprettelse af session.";
  }
}