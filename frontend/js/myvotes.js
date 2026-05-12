/* MY VOTES: 
Dette JS håndterer de sange, brugeren har stemt på via mainpage.html.
Stemmerne bliver ikke hardcoded direkte i HTML.
I stedet gemmes de i og hentes fra localStorage.
Stemmerne gemmes og hentes ud fra det aktuelle session_id, 
som fungerer som en nøgle til at hente de korrekte votes.
Det betyder, at hver bruger på hver session har sin egen midlertidige liste af sange, 
som brugeren har stemt på.
Den midlertidige liste af sange, som brugeren har stemt på ryddes ved at slette alle eller bekræfte alle stemmer.
Eksempel:
Hvis session_id er 12, gemmes de sange, bruger har stemt på, i LocalStorage under: votes_session_12 */



  /* ERROR BOX:
  viser fejltekst i en popup box, der forsinder af sig selv.
  Kald blot funktionen showError(""), og boksen vises med tekst i */
import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");



  /* myVotesList: 
Vi deklærer en const variabel vha. querySelector, som slår op i html 
og finder det første element med class="myVotesList" (fra myvotes.html).
Det er i dette element, at vi senere vha. JS render listen med sange, 
som brugeren ønsker at stemme på. 
*/
const myVotesList = document.querySelector(".myVotesList");
  /* lastDeletedTrack:
variabel til historik over slettede sange (til undo funktion) */
let lastDeletedTrack = null;
  /* DOMContentLoaded:
Når html er fuldt indlæset og parsed(fortolket), kaldes renderVotes().
*/
document.addEventListener("DOMContentLoaded", renderVotes());



/* RENDER LISTEN AF TRACKS SOM BRUGER HAR STEMT PÅ */ 
  /* renderVotes():
  Funktionen render en liste af tracks, som brugeren har stemt (votes) på i den session, han er i.
  Funktionen bliver kaldt når: 
  * myvotes.html åbnes,
  * brugeren sletter en sang på listen,
  * brugeren fortryder slet af en sang på listen,
  * brugeren sletter alle sange på listen.
  På den måde bliver listen altid opdateret efter ændringer.
  */
function renderVotes() {
    /* checkSession():
    Vi kalder checkSession for at hente SessionId. 
    Hvis der ikke er en session, stopper funktionen ved if (!sessionId) {return;}.
    I checkSession() sendes brugeren alligevel tilbage til index.html, hvis !sessionId. */
  const sessionId = checkSession();
  if (!sessionId) {
    return;
  }

    /* getSessionVotes():
    Henter tracks som brugeren har stemt på, men ikke bekræftet eller slettet endnu.
    gemmes som værdi i variablen votes.
    Funktionen benytter LocalStorage. 
    Værdien vil være et array. */
  const votes = getSessionVotes();
    /* elementet gøres tomt:
    I tilfælde af, at der allerede står noget på listen. 
    Vi undgår, at de samme sange bliver vist flere gange efter hinanden,
    hver gang renderVotes() bliver kaldt. */
  myVotesList.innerHTML = "";

    /* if (votes.length === 0):
    Hvis man ikke har valgt nogen sange endnu, er listen tom, og der 
    vises både tekst og en besked om, at man ikke har valgt nogen sange */
  if (votes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "zeroVotesMessage";
    emptyMessage.textContent = "Du har ikke valgt nogen sange";
    showError("Du har ikke valgt nogen sange");
    myVotesList.appendChild(emptyMessage);
    return;
  }

    /* forEach:
    forEach metoden går gennem alle indexes i votes array'et én ad gangen.
    track = det enkelte track
    index = sangens placering i arrayet
    */
  votes.forEach(function(track, index) {
      /* Opretter et <li>-element pr. track */
    const li = document.createElement("li");
      /* Giver <li> class="myVotesColumn", så vi kan style den i CSS */
    li.className = "myVotesColumn";
      /* Opretter et <div>-element til track title og delete knap */
    const trackText = document.createElement("div");

      /* Render tekst med nummerering, sangtitel og artist:
          Eksempel på resultat:
          1. Pink + White - Frank Ocean 

      * `${...}` kaldes en template string.
        Den gør det muligt at blande almindelig tekst og JavaScript-værdier.

      * index + 1:
        Viser nummerering i listen og starter fra 1.
        Index starter altid på 0 i JavaScript.
        Derfor bruger vi index + 1, så listen starter ved 1 i stedet for 0.

      * getTrackTitle(Track):
        Kalder funktion med track objektet som argument og returnerer track_title.

      * getArtistName(Track):
        Kalder funktion med track objektet som argument og returnerer artist.
      */
    trackText.textContent = `${index + 1}. ${getTrackTitle(track)} - ${getArtistName(track)}`;

      /* Opretter en slet-knap pr. track 
        Knappen tildeles properties: classes og title og vi tilføjer et img-tag i knappen. 
        Knappen tilføjes en event listener "click", som vil kalde funktionen removeTrack. 
        getTrackId(track) bruges, fordi sangens id enten kan hedde: track_id eller id. 
        removeTrack(...) fjerner sangen fra localStorage og opdaterer listen.*/
    const deleteButton = document.createElement("button");
    deleteButton.className = "deleteBtn CircleBtn";
    deleteButton.title = "Remove track from my votes";
    deleteButton.innerHTML = `<img src="images/delete.png" class="centerBtnImg">`
    deleteButton.addEventListener("click", function() {
      removeTrack(getTrackId(track));
    });
      /* Lægger nummerering, sangtitel og artist navn ind i parent elementet <li> */
    li.appendChild(trackText);
      /* Lægger delete-knappen ind i parent elementet <li> */
    li.appendChild(deleteButton);
      /* Lægger hele <li> som child ind i parent elementet <ul class="myVotesList"> */
    myVotesList.appendChild(li);
  });
}



/* FJERN ÉT TRACK FRA MYVOTES */
/* removeTrack(trackId):
Når brugeren klikker på slet-knappen (class="deleteBtn"), slettes sangen på samme række som knappen.
track_Id er id'et på den sang, der skal fjernes.
*/
function removeTrack(trackId) {
/* getSessionVotes():
Kalder funktionen og henter den nuværende liste af valgte sange på MyVotes fra LocalStorage */
  let votes = getSessionVotes();
/* newVotes =[]:
Vi laver in-place filtrering: vi tager et array, fjerner et uønsket element og gemmer det nye array i variablen.
Hvis et trackId fra votes array'et !== det trackId, som brugeren har trykket slet på, pushes det til det nye array. 
Hvis et trackId fra votes array'et === det trackId, som brugeren har trykket slet på, hopper vi til næste index. 
newVotes bliver derfor et array med de sange, der er tilbage, udover den, som brugeren har trykket slet på. 
Vi beholder kun de sange, hvor sangens id IKKE matcher trackId.
*/
  let newVotes = [];
  let i = 0;
  while (i < votes.length) {
    if (getTrackId(votes[i]) !== trackId) {
      newVotes.push(votes[i]);
    }
    if (getTrackId(votes[i]) === trackId) {
      lastDeletedTrack = votes[i]
      console.log("Last deleted track: " + lastDeletedTrack.track_title + " - " + lastDeletedTrack.artist)
    }
    i++;
  }
  votes = newVotes;
/* saveSessionVotes(votes):
Det opdaterede array gemmes i localStorage */
  saveSessionVotes(votes);

/* renderVotes():
Render listen med MyVotes igen, så siden opdateres med det samme */
  renderVotes();
}



/* GEMMER ARRAY MED TRACKS TIL MYVOTES LISTEN */
/* saveSessionVotes:
Gemmer valgte sange for den aktuelle bruger til MyVotes listen.
De bruges senere, når de tilføjes til vores afspilningskø.

votesKey = henter string med current session_id (fx votes_session_1)
localStorage kan kun gemme tekst/string.
Derfor bruger vi JSON.stringify til at lave arrayet om til tekst.
*/
function saveSessionVotes(votes) {
  const votesKey = getVotesStorageKey();
  localStorage.setItem(votesKey, JSON.stringify(votes));
}
/* HENTER LISTE MED TRACKS TIL MYVOTES FRA LOCALSTORAGE */
/* getSessionVotes:
localStorage gemmer kun tekst/string.
Derfor bruger vi JSON.parse til at fortolke/oversætte teksten til et JavaScript-array.
votesKey = en liste med de sange, som ligger i MyVotes listen for brugeren. 
Hvis der ikke findes nogen gemte votes endnu, returnerer vi en tom liste [].
*/
function getSessionVotes() {
  const votesKey = getVotesStorageKey();
  return JSON.parse(localStorage.getItem(votesKey)) || [];
}



/* OPRET UNIK STRING PR. SESSION */
/* getVotesStorageKey:
Kalder getCurrentSessionId for at finde session_id. 
Den returnerer det som votes_session_##. 
Den her funktion muliggør, at hver midlertidige MyVotes-liste er unik for hver session, 
ved at give dem et navn ud fra hvilken session brugeren er i fra localStorage.
Vi bruger session_id i navnet, så hver session har sin egen MyVotes-liste.

Eksempel:
finder: session_id = 5
returner: "votes_session_5"
*/
function getVotesStorageKey() {
  const sessionId = getCurrentSessionId();
  return `votes_session_${sessionId}`;
}



/*TJEKKER OM BRUGER ER I EN SESSION ELLERS KICK*/
//TODO: Er denne funktion nødvendig? 
/* checkSession:
Failsafe funktion. 
Funktionen "checkSession" tjekker om brugeren rent faktisk er i en session.
Hvis der ikke findes et session_id i localStorage, 
bliver brugeren sendt tilbage til forsiden.
Det forhindrer, at man går direkte ind på myvotes.html uden først at have
oprettet eller joinet en session.
*/
function checkSession() {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    window.location.href = "index.html";
    return null;
  }
  return sessionId;
}



/* FINDER SESSION_ID FRA LOCALSTORAGE */
/* getCurrentSessionId:
Finder det session_id, som brugeren er i.
session_id bliver gemt i localStorage, når brugeren enten:
1.Opretter en session i createsession.js
2.Joiner en session i joinsession.js
*/
function getCurrentSessionId() {
  return localStorage.getItem("session_id");
}



/* FIND TRACK_ID */
/* getTrackId: 
Funktionen har track som som argument. 
track er en ordbog med fx:
{mood_id: 1, mood: 'Energetic', track_id: 13, track_title: 'Happier', artist: 'Marshmello'}
Den slår op i ordborgen på track_id eller id. 

Funktionen er fleksibel, for at sikre at vi får et id retur. 
Defensiv programmering i tilfælde af fejl fra DB eller data fra flere kilder. 
I tilfælde af, at vores sang-objekter måske ikke altid bruger samme property-navne: 
Eksempel 1: { track_id: 3, track_title: "Track", artist_name: "Artist" }
Eksempel 2: { id: 3, title: "Track", artist: "Artist" }
Hvis track_id er undefined eller null returnerer vi blot id. Ellers returnerer vi track_id. 
*/
function getTrackId(track) {
  if (track.track_id === undefined || track.track_id === null) {
    return track.id
  } else {
  return track.track_id
  }
}

/* getTrackTitle:
Slår op i track objektet og returnerer track_title.
Hvis undefined eller null: "Error: Unable to load track title"*/
function getTrackTitle(track) {
  if (track.track_title === undefined || track.track_title === null) {
    return "Unknown track title"
  } else {
  return track.track_title
  }
}

/* getArtistName:
Slår op i track objektet og returnerer artist_name. 
Hvis undefined eller null: "Unable to load artist name"
*/
function getArtistName(track) {
  if (track.artist_name === undefined || track.artist_name === null) {
    return "Unable to load artist name"
  } else {
  return track.artist_name
  }
}



/* 
Fortryder den sidst valgte sang.

pop() fjerner det sidste element i arrayet.
Det passer til "undo last vote".
*/
function undoLastVote() {
  const votes = getSessionVotes();

  votes.pop();

  saveSessionVotes(votes);
  renderVotes();
}

/* 
Her sletter vi alle valgte sange for den aktuelle session.

Vi gemmer bare et tomt array [].
Så findes sessionen stadig, men vote-listen er tom.
*/
function deleteAllVotes() {
  saveSessionVotes([]);
  renderVotes();
}

/* 
Her bekræfter vi votes.

Lige nu sender funktionen ikke noget til backend endnu.
Den logger bare session_id og votes i console.

Senere kan denne funktion udvides til at sende votes til server.js,
så de kan gemmes i databasen.
*/
function confirmVotes() {
  const sessionId = getCurrentSessionId();
  const votes = getSessionVotes();

  if (votes.length === 0) {
    alert("Du har ikke valgt nogen sange endnu.");
    return;
  }

  console.log("Bekræftede votes for session:", sessionId);
  console.log(votes);

  alert("Dine votes er bekræftet.");
}

/* 
Her har vi valgt at gøre funktionerne tilgængelige globalt.

Det er nødvendigt, fordi myvotes.html bruger onclick direkte i HTML, fx:
onclick="undoLastVote()"

Uden window.undoLastVote = undoLastVote ville HTML'en ikke kunne finde funktionen.
*/
window.removeTrack = removeTrack;
window.undoLastVote = undoLastVote;
window.deleteAllVotes = deleteAllVotes;
window.confirmVotes = confirmVotes;


/* INVITE FRIEND
Denne del styrer Invite friend-knappen på myvotes.html.
Knappen viser den session_id, som en ven skal bruge på Join-siden.
*/

/*
Når brugeren klikker på knappen:
1. Finder vi session_id fra localStorage
2. Viser session_id i popup'en
3. Vennen kan bruge dette id på Join-siden
*/

/* Finder Invite friend-knappen fra HTML */
const inviteFriendButton = document.getElementById("inviteFriendButton");

/* Finder selve popup-boksen fra HTML */
const inviteFriendPopup = document.getElementById("inviteFriendPopup");

/* Finder det felt i popup'en, hvor session_id skal vises */
const inviteSessionId = document.getElementById("inviteSessionId");

/* Finder luk-knappen i popup'en */
const closeInvitePopup = document.getElementById("closeInvitePopup");

/* Når brugeren klikker på Invite friend-knappen, åbnes popup'en */
inviteFriendButton.addEventListener("click", showInviteFriendPopup);

/* Når brugeren klikker på krydset, lukkes popup'en */
closeInvitePopup.addEventListener("click", hideInviteFriendPopup);

/* Viser popup'en med den aktuelle session_id */
function showInviteFriendPopup() {
  const sessionId = getCurrentSessionId();

  /* Hvis der ikke findes en session_id, betyder det at brugeren ikke er i en session */
  if (!sessionId) {
    alert("Du er ikke i en session endnu.");
    return;
  }

  /* Viser session_id inde i popup'en */
  inviteSessionId.textContent = sessionId;

  /* Gør popup'en synlig */
  inviteFriendPopup.style.display = "block";
}

/* Skjuler popup'en igen */
function hideInviteFriendPopup() {
  inviteFriendPopup.style.display = "none";
}


