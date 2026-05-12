/* API KODE */

/* SESSION + VOTES
Denne fil holder styr på hvilken session brugeren er i.

Den bruges til:
1. at gemme session_id når man opretter/joiner en session
2. at hente session_id på andre sider
3. at gemme valgte sange/votes pr. session
4. at hente valgte sange igen på myvotes.html
*/


/* 
Gemmer den session brugeren lige har oprettet eller joinet.

Parameteren session er et objekt fra backend.
Det kan fx se sådan her ud:

{
  session_id: 12,
  is_private: false
}
*/
function saveCurrentSession(session) {
  /* Gemmer session_id i browseren */
  localStorage.setItem("session_id", session.session_id);

  /* Gemmer om sessionen er privat eller shared */
  localStorage.setItem("is_private", session.is_private);
}


/* 
Henter session_id fra browserens localStorage.

Denne funktion bruges på sider, hvor vi skal vide,
hvilken session brugeren er i.
*/
function getCurrentSessionId() {
  return localStorage.getItem("session_id");
}


/* 
Tjekker om brugeren er i en session.

Hvis der ikke findes et session_id, betyder det,
at brugeren ikke har oprettet eller joinet en session endnu.

Så sendes brugeren tilbage til forsiden.
*/
function requireCurrentSession() {
  const sessionId = getCurrentSessionId();

  /* Hvis sessionId er null eller tom, findes der ingen aktiv session */
  if (!sessionId) {
    window.location.href = "index.html";
    return null;
  }

  /* Hvis sessionId findes, returnerer vi det */
  return sessionId;
}


/* 
Laver navnet på den localStorage-key,
hvor valgte sange/votes skal gemmes.

Vi bruger session_id i navnet, så hver session får sin egen vote-liste.

Eksempel:
session_id = 7
key = "myVotes_session_7"

OBS:
Hvis resten af projektet bruger "votes_session_7",
skal denne linje ændres, så alle filer bruger samme key.
*/
function getVotesStorageKey() {
  const sessionId = getCurrentSessionId();

  return `votes_session_${sessionId}`;
}


/* 
Henter de valgte sange/votes for den aktuelle session.

localStorage gemmer kun tekst.
Derfor bruger vi JSON.parse til at oversætte LocalStorage-teksten tilbage til et array.

Hvis der ikke findes nogen votes endnu, returnerer vi en tom liste [].
*/
function getSessionVotes() {
  const votesKey = getVotesStorageKey();

  const votesFromLocalStorage = localStorage.getItem(votesKey);

  return JSON.parse(votesFromLocalStorage) || [];
}


/* 
Gemmer valgte sange/votes for den aktuelle session.

votes er et array med sang-objekter.
localStorage kan kun gemme tekst, 
så vi bruger JSON.stringify for at oversætte vores array til LocalStorage-tekst.
*/
function saveSessionVotes(votes) {
  const votesKey = getVotesStorageKey();

  localStorage.setItem(votesKey, JSON.stringify(votes));
}


/* 
Tilføjer én sang til den aktuelle sessions votes.
Parameteren track er den sang, brugeren har trykket vote på.
track er et dictionary, som fx se sådan her ud:
{
  track_id: 4,
  track_title: "Pink + White",
  artist_name: "Frank Ocean"
}
*/
function addTrackToSessionVotes(track) {
  /* Henter de votes, der allerede er gemt for sessionen */
  const votes = getSessionVotes();

  /* 
  Vi laver en variabel, der starter som false.
  Den skal bruges til at huske, om vi finder sangen i listen.
  */
  let alreadyChosen = false;

  /*
  i bruges som tæller/index.
  Den starter på 0, fordi arrays i JavaScript starter ved index 0.
  */
  let i = 0;

  /*
  While-loopet kører så længe:
  1. i er mindre end votes.length
  2. alreadyChosen stadig er false

  Det betyder, at loopet stopper, hvis:
  - vi har kigget hele listen igennem
  - eller vi finder sangen
  */
  while (i < votes.length && alreadyChosen === false) {
    /*
    Hvis track_id på den gemte vote er det samme som track_id
    på den sang brugeren prøver at tilføje,
    så er sangen allerede valgt.
    */
    if (votes[i].track_id === track.track_id) {
      alreadyChosen = true;
    }

    /*
    Går videre til næste sang i votes-listen.
    */
    i++;
  }

  /*
  Hvis sangen allerede findes, stopper funktionen her.
  Det forhindrer, at samme sang bliver tilføjet flere gange.
  */
  if (alreadyChosen) {
    return;
  }

  /*
  Hvis sangen ikke allerede findes, tilføjer vi den til votes-arrayet.
  */
  votes.push(track);

  /*
  Gemmer den opdaterede votes-liste i localStorage.
  */
  saveSessionVotes(votes);
}


/* 
Fjerner én sang fra den aktuelle sessions votes.

trackId er id'et på den sang, der skal fjernes.
*/
function removeTrackFromSessionVotes(trackId) {
  /* Henter de nuværende votes */
  let votes = getSessionVotes();

  /* 
  Filtrering på votes-arrayet. 
  Her bruger vi et while-loop, fordi vi skal fjerne elementer fra arrayet, 
  mens det er i brug (live).
  Hvis track_id på det gemte vote-array IKKE er lig det trackId, 
  som bruger har klikket på, beholder vi sangen i votes-listen.
  i er vores tæller
  j markere det index som skal slettes fra array'et
  */
  const n = votes.length;
  let i = 0; 
  let j = 0;
  while (i < n) {
    if (votes[i].track_id !== trackId) {
      votes[j] = votes[i];
      j = j + 1;
    }
    i = i + 1;
  }
  votes.splice(j);

  /* Gemmer den nye filtrerede liste */
  saveSessionVotes(votes);
}


