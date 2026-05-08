/* MY VOTES

Denne side viser de sange, brugeren har valgt på mainpage.html.

Sangene bliver ikke hardcoded direkte i HTML længere.
I stedet henter vi dem fra localStorage.

Vi gemmer sangene ud fra den aktuelle session_id.
Det betyder, at hver session har sin egen liste af valgte sange.

Eksempel:
Hvis session_id er 12, gemmes sangene under:
votes_session_12
*/

/* ERROR BOX: 
viser fejltekst i en popup box der forsvinder af sig selv
Kald blot funktionen showError("") og boksen vises med tekst i*/
import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");

/* 
Herunder er <ul class="myVotesList"></ul> i myvotes.html.
Det er inde i denne liste, at vi senere indsætter sangene med JavaScript. 
*/
const myVotesList = document.querySelector(".myVotesList");

/* 
Derefter finder vi den session brugeren er i.
session_id bliver gemt i localStorage, når brugeren enten:
1.Opretter en session i createsession.js
2.Joiner en session i joinsession.js
*/
function getCurrentSessionId() {
  return localStorage.getItem("session_id");
}

/* 
Derefter tjekker vi om brugeren faktisk er i en session.
Hvis der ikke findes et session_id i localStorage, bliver brugeren sendt tilbage til forsiden.

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

/* 
Når vi så har gjort det laver vi navnet på den localStorage-key, hvor votes skal gemmes.

Vi bruger session_id i navnet, så hver session har sin egen vote-liste.

Eksempel:
session_id = 5
votesKey = "votes_session_5"
*/
function getVotesStorageKey() {
  const sessionId = getCurrentSessionId();
  return `votes_session_${sessionId}`;
}

/* 
Så hentes alle valgte sange for den aktuelle session.

localStorage gemmer kun tekst/string.
Derfor bruger vi JSON.parse til at lave teksten om til et JavaScript-array igen.

Hvis der ikke findes nogen gemte votes endnu, returnerer vi en tom liste [].
*/
function getSessionVotes() {
  const votesKey = getVotesStorageKey();
  return JSON.parse(localStorage.getItem(votesKey)) || [];
}

/* 
Derefter gemmes alle valgte sange for den aktuelle session.

votes er et JavaScript-array.
localStorage kan kun gemme tekst/string.
Derfor bruger vi JSON.stringify til at lave arrayet om til tekst.
*/
function saveSessionVotes(votes) {
  const votesKey = getVotesStorageKey();
  localStorage.setItem(votesKey, JSON.stringify(votes));
}

/* 
Den måde sangene vises på siden,
bliver kaldt når:
Enten når myvotes.html åbnes,
Eller når man sletter en sang,
Eller når man fortryder sidste vote,
Eller når man sletter alle votes.

På den måde bliver listen altid opdateret efter ændringer.
*/
function renderVotes() {
  const sessionId = checkSession();

  /* 
  Hvis der ikke er en session, stopper funktionen her.
  checkSession() har allerede sendt brugeren tilbage til index.html. 
  */
  if (!sessionId) {
    return;
  }

  /* 
  Her hentes de gemte sange for den aktuelle session 
  */
  const votes = getSessionVotes();

  /* 
  Tømmer listen først.
  Det gør vi for at undgå, at de samme sange bliver vist flere gange,
  hver gang renderVotes() bliver kaldt. 
  */
  myVotesList.innerHTML = "";

  /* 
  Hvis listen er tom, viser vi en besked i stedet for en tom side 
  */
  if (votes.length === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "myVotesColumn";
    emptyMessage.textContent = "Du har ikke valgt nogen sange endnu.";
    showError("Du har ikke valgt nogen sange endnu.");
    myVotesList.appendChild(emptyMessage);
    return;
  }

/* 
Derefter går vi igennem alle valgte sange én ad gangen.

song = den enkelte sang
index = sangens placering i arrayet

index starter altid på 0 i JavaScript.
Derfor bruger vi index + 1, så listen starter ved 1 i stedet for 0.
*/
  votes.forEach((song, index) => {
/* 
Opretter et <li>-element til én sang 
*/
    const li = document.createElement("li");

/* 
Giver <li> samme class som vi bruger i CSS,
så sangen får samme styling som resten af siden. 
*/
li.className = "myVotesColumn";

/* 
Opretter et <span>-element til selve sangteksten.
Vi bruger span, fordi delete-knappen også skal ligge inde i samme <li>. 
*/
    const songText = document.createElement("span");

/* Her laver vi teksten, der vises på siden.

`${...}` kaldes en template string.
Den gør det muligt at blande almindelig tekst og JavaScript-værdier.

index + 1:
Viser sangens nummer i listen.
index starter på 0, så derfor lægger vi 1 til.

getSongTitle(song):
Finder sangens titel.
Funktionen kan både håndtere song.track_title og song.title.
getArtistName(song):
Finder kunstnerens navn.
Funktionen kan både håndtere song.artist_name og song.artist.
Eksempel på resultat:
1. Pink + White - Frank Ocean
*/
    songText.textContent = `${index + 1}. ${getSongTitle(song)} - ${getArtistName(song)}`;

/* 
Opretter slet-knappen til den enkelte sang 
*/
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.title = "Delete song";
    deleteButton.textContent = "X";

/* 
Når man klikker på slet-knappen, sletter vi kun denne sang.

getSongId(song) bruges, fordi sangens id kan hedde enten:
- track_id
- id
removeSong(...) fjerner sangen fra localStorage og opdaterer listen.
*/
    deleteButton.addEventListener("click", () => {
      removeSong(getSongId(song));
    });

/* Lægger sangteksten ind i <li> */
    li.appendChild(songText);

/* Lægger delete-knappen ind i samme <li> */
    li.appendChild(deleteButton);

/* Lægger hele <li> ind i <ul class="myVotesList"> */
    myVotesList.appendChild(li);
  });
}

/* 
Herefter finder vi sangens id.

Vi har lavet funktionen fleksibel, fordi vores gruppes sang-objekter
måske ikke altid bruger samme property-navne.

Hvis objektet har track_id, bruger vi det.
Ellers prøver vi id.

Eksempel 1:
{ track_id: 3, track_title: "Song", artist_name: "Artist" }

Eksempel 2:
{ id: 3, title: "Song", artist: "Artist" }
*/
function getSongId(song) {
  return song.track_id || song.id;
}

/* 
Efter finder vi sangens titel.

Nogle steder kan sangens titel hedde track_title.
Andre steder kan den hedde title.

Hvis ingen af dem findes, viser vi "Ukendt sang",
så siden ikke crasher eller viser undefined.
*/
function getSongTitle(song) {
  return song.track_title || song.title || "Ukendt sang";
}

/* 
Derefter finder vi kunstnerens navn.

Nogle steder kan kunstneren hedde artist_name.
Andre steder kan den hedde artist.

Hvis ingen af dem findes, viser vi "Ukendt artist".
*/
function getArtistName(song) {
  return song.artist_name || song.artist || "Ukendt artist";
}

/* 
Her har vi gjort det muligt at slette én sang fra votes.

track_Id er id'et på den sang, der skal fjernes.
*/
function removeSong(trackId) {
/* 
Henter den nuværende liste af valgte sange 
*/
  let votes = getSessionVotes();

/* 
filter laver et nyt array.
Vi beholder kun de sange, hvor sangens id IKKE matcher track_Id.

Det betyder:
- Hvis sangens id er det samme som track_Id, fjernes den.
- Alle andre sange bliver i listen.
*/
  votes = votes.filter((song) => {
    return getSongId(song) !== trackId;
  });

/* 
Gemmer den nye opdaterede liste i localStorage 
*/
  saveSessionVotes(votes);

/* 
Tegner listen igen, så siden opdateres med det samme 
*/
  renderVotes();
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
window.removeSong = removeSong;
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


/* 
Når myvotes.html åbnes, kører renderVotes() med det samme.

Det betyder, at siden automatisk viser de sange,
der allerede er gemt for den aktuelle session.
*/
renderVotes();