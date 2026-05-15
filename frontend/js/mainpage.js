/* MAINPAGE
Dette js henter data til Mainpage.html
Det genererer en liste af moods, som mood-knapper oprettes efter.
Når man trykker på en mood-knap, hentes 5 sange til valgt mood og de vises i en popup box.
Hvis brugeren klikker på krydset i en box, lukker den boxen.
Hvis brugeren ikke synes om de 5 sange kan brugeren klikke på refresh-knappen, og så hentes 5 nye sange til den mood.
*/




/* ERROR BOX: 
viser fejltekst i en popup box der forsvinder af sig selv
Kald blot funktionen showError("") og boksen vises med tekst i */
import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");

const moodContainer = document.getElementById("moodcontainer"); //container til mood knapper
let isMoodBoxOpen = null // variabel til at se, om MoodBox er åben eller lukket
let allTracks = []; /* variabel til alle tracks */


// TODO: Vis noget loading inden knapperne er dannet, eller spørg Mikkel til loading rækkefølgen?


/* HENT ALLE TRACKS & MOODS FRA DB */
document.addEventListener("DOMContentLoaded", loadTracks);
async function loadTracks() {
    const response = await fetch('/api/moods/tracks');
    /* await fetch:
    henter tracks fra backend via api
    await fetch giver ikke data med det samme. 
    Den returnerer et promise ("jeg er gået i gang med HTTP request, resultatet kommmer senere")
    Await fortæller at funktionen stopper indtil der kommer svar. 
    Men browseren kan stadig køre andre events*/
    console.log("Response:" + response.status);
    if (response.ok) {
        allTracks = await response.json();
        console.log("Loaded list of all tracks from database:");
        console.log(allTracks);
    } else {
        console.log("error");
        showError("It was not possible to load any tracks from the database!");
    }
}


/* MOOD BUTTONS GENERATOR */
let moodsList = [];
document.addEventListener("DOMContentLoaded", loadMoods); /* funktionen kaldes når html er indlæst */
async function loadMoods() {
    const response = await fetch('/api/moods');  /* kalder API. response = ordbog med moods fra DB */
    console.log("Response: " + response.status); /* tjekker om vi har svar fra api */
    
    if (response.ok) {
        const moodsList = await response.json(); /* deklærer const variabel MoodList og giver den ordbogen som værdi */
        console.log("Loaded list of all moods from database:");
        console.log(moodsList);

        moodContainer.innerHTML=""; 
        /*moodContainer.innerHTML="";:
        En failsafe, der rydder containeren. 
        I tilfælde af at der allerede er indhold i den. 
        Så undgår vi, at den opretter contet 2 gange */
        /* forEach: 
        For hvert element i NodeList'en render vi en knap med attributes og tekstindhold*/
        moodsList.forEach(function(mood) {
            const div = document.createElement("div");/*laver en div rundt om knappen*/
            const button = document.createElement("button"); /*laver selveste knappen*/
            button.classList.add("openMoodBox"); /* button får class="openMoodBox"*/
            button.dataset.target = mood.mood.toLowerCase();/*laver data-target attribut til button med navnene på moods*/
            const p = document.createElement("p");
            p.classList.add("moodButtonText");
            p.textContent=mood.mood;/*sætter tekst på knapperne*/
            button.appendChild(p);/*sætter p tagget ind i knappen*/ 
            button.addEventListener("click",function(){
            console.log("You chose: " + mood.mood + " mood!"); /*skriver det valgte mood ind i konsollen*/ 
            const target = button.dataset.target;
            const moodBox = document.getElementById(target);
                if (moodBox) {
                    moodBox.classList.add("active");
                } else {
                    console.log("Can't find moodBox",target);
                    showError("Cannot open the chosen mood menu")
                }
            });
        div.appendChild(button);/*sætter knappen ind i div'en*/
        moodContainer.appendChild(div);/* sætter div'en ind i moodcontainer*/
        });  
    } else {
        console.log("error");
        showError("It was not possible to load any moods from the database!");
    }
}


/* OPEN MOOD BOXES */
let targetBox
const moodBoxes = document.querySelectorAll(".moodBox");
/* .querySelectorAll:
finder alle elementer med class="MoodBox"
og returnerer en NodeList (liste med elementer)*/
document.addEventListener("click", function(event) {
    const button = event.target.closest(".openMoodBox"); /* button rammer det element, der er tættest på med sit click event */
    if (button) {
        targetBox = button.dataset.target;
/* button.dataset.target:
const targetBox oprettes fra attributten "data-target" fra html 
I html har hver knap sit eget data-target, så de kan pege på hver sin class*/
        const box = document.getElementById(targetBox);
        /* const box: 
        DOM Element, fx <div id="chill" class="moodBox">
        Det er den box, som vi vil ændre på (åbne).
        Den rammer vi vha. getElementById(targetBox). 
        I stedet for (targetBox), kunne vi have skrevet en class på en box, 
        men vi har 6 boxe, som skal åbnes med hver deres knap... 
        På denne måde kan vi ramme alle 6 med én funktion*/
        const tracksForMood = getTracksForMood(allTracks, targetBox);
        const fiveTracks = getFiveTracks(tracksForMood);
        renderTracks(fiveTracks, box);
        if (box) {
            box.style.display = "block";
            isMoodBoxOpen = true
            console.log("isMoodBoxOpen: " + isMoodBoxOpen + " --- The " + targetBox + " MoodBox is open!")
        setTimeout(function () {
            box.style.opacity = "1";
            box.style.pointerEvents = "auto";
        }, 200);
        } else {
            console.log("Can't find moodBox",targetBox);
        }
    }
});


/* REFRESH TRACKS BUTTON */
const refreshTracksButton = document.querySelectorAll(".refreshTracks"); /* vælger vores button med class="refreshTracks" */
refreshTracksButton.forEach(function(button) {
    button.addEventListener("click", function() {
        console.log("Resfreshing track list...")
        const box = button.closest(".moodBox"); /* finder den popup box der er tættest på knappen (parent til knappen) */
        const mood = box.id /* slår op i elementet og gemmer dets id i variablen mood (det kan fx være "chill") */
        const tracksForMood = getTracksForMood(allTracks, mood); /* vi kalder funktionen getTracksForMood for tracks for det mood, som er tættest på knappen */
        const fiveTracks = getFiveTracks(tracksForMood); /* vi kalder funktionen getFiveTracks for at blande sangene og returnere 5 */
        renderTracks(fiveTracks, box) /* vi kalder funktionen renderTracks for at render de 5 nye tracks i moodBox */
    });
});


/* CLOSE MOOD BOXES */
const closeMoodBoxButtons = document.querySelectorAll(".closeMoodBox"); 
/* .querySelectorAll:
finder alle elementer med class="closeMoodBox"
og returnerer en NodeList (liste med elementer) */
closeMoodBoxButtons.forEach(function(button) {
    button.addEventListener("click", closeMoodBox);
});
/* .forEach: 
aktiverer funktionen closeMoodBoxes for hvert DOM element i NodeList'en
.addEventListener tilføjer en EventListener("click") til elementerne
*/
function closeMoodBox(event) {
    const moodBox = event.target.closest(".moodBox");
/* event.target.closest: 
event.target er det element man klikker på.
.closest finder den tætteste indsatte parameter (her classen moodBox).
Tætteste=den går opad i DOM-træet: 
Først tjekkes elementet selv, så parent og så parent's parent osv.
Derfor finder den den moodBox, som knappen er i og udfører nedenstående*/
    setTimeout(function() {
        moodBox.style.opacity = "0";
        moodBox.style.pointerEvents = "none"
    }, 200);
/* setTimeout: 
venter x milliseconds, 
inden popup menuen skifter til opacity=0 (bliver gennemsigtig),
så man kan se knappen reagere*/
    setTimeout(function() {
        moodBox.style.display = "none";
    }, 500);
    isMoodBoxOpen = false
    console.log("isMoodBoxOpen: " + isMoodBoxOpen + " --- The " + targetBox + " MoodBox has been closed!")
/* setTimeout: 
venter 500 ms inden boxen bliver helt skjult igen, 
fordi den har style="transition: opacity 0.5s"*/
}

/* GO TO MY VOTES BUTTON */
const goToMyVotesButtons = document.querySelectorAll(".myVotesButton")
goToMyVotesButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        window.location.href = "myvotes.html";
    });
});

/* Funktion til at filtrerer sange fra allTracks efter mood: 
Funktionen returner via et opslag på mood i den track parameter vi giver den
Og hvis mood === mood, tages track med i resultatet
Vi skal bruge toLowerCase(), da vores moods står med stort forbogstav (fx Chill) 
i csv/databasen */
function getTracksForMood(allTracks, mood) {
    const tracksForMood = [];
    const n = allTracks.length;
    let i = 0;
    while (i < n) {
        if (allTracks[i].mood.toLowerCase() === mood.toLowerCase()) {
            tracksForMood.push(allTracks[i]);
        }
        i++;
    }
    console.log("Generated tracks for selected mood (" + mood + "): ");
    console.log(tracksForMood);
    return tracksForMood;
}


/* Funktion til at blande sange og returnere 5 */
// TODO: Spørg Mikkel om vi har en side-effekt her? Er det korrekt måde at slice et array på? // Lige nu: Hver gang vi kalder funktionen, skal vi gøre det med alle sange forfra for at vi ikke får biprodukt. 
function getFiveTracks(tracksForMood) {
    const mixedTracks = tracksForMood.sort(function(){
        return Math.random() - 0.5; 
        /* .sort: 
        vi sorterer i arrayet med Math.random (dvs. blander indexes tilfældigt) 
        laver et tilfældigt tal mellem 0 og 1, og bruges til at blande listen */
    });
    console.log("Shuffled 5 new tracks for selected mood: (" + tracksForMood[0].mood + ")")
    console.log(mixedTracks.slice(0, 5));
    return mixedTracks.slice(0, 5);
    /* mixedTracks.slice:
    tager index 0 til 4 af de blandede indexes og returneres */
}


/*GENERERE SANGELISTE TIL MOODBOXES*/
function renderTracks(tracks, box) {
    const moodTrackList = box.querySelector(".moodTrackList"); /* finder alle elementer i vores box med class="moodTrackList" */
    moodTrackList.innerHTML = ""; /* rydder indholdet i elementet sange fra pop-up vinduet */
    
    if (tracks.length === 0) { /* hvis der ikke er mixed/shuffled nogen sange getFiveTracks funktionen */
        showError("It was not possible to render any tracks for this mood");
        return;
    } else {
        tracks.forEach(function(track) {
            /* opretter én div pr. sang, rækkerne har class="moodTrackRow" */
            const moodTrackRow = document.createElement("div");
            moodTrackRow.classList.add("moodTrackRow");
            
            /* opretter en text container, class="trackText" */          
            const moodTrackText = document.createElement("p"); 
            moodTrackText.classList.add("moodTrackText");

            /* 
            Indsætter sangens tekst.
            track.track_title kommer fra backend/server.js.
            track.artist_name virker kun, hvis backend også sender artist_name med.
            Hvis artist_name ikke findes endnu, viser vi "Unknown artist" i stedet for undefined. 
            */
            moodTrackText.textContent = `${track.track_title || "Unknown track"} - ${track.artist || "Unknown artist"}`;
            
            /* opretter vote knap, class="voteBtn", indsætter billede */
            const voteButton = document.createElement("button");
            voteButton.className = "voteBtn CircleBtn";
            voteButton.innerHTML = `<img src="images/vote_button.png" class="centerBtnImg">`;

            /* Kalder addSongToVotes:
            Når brugeren klikker på vote-knappen ved en sang,
            kaldes addSongToVotes funktionen, som gemmer sangen i localStorage
            */
            voteButton.addEventListener("click", function () {
                addSongToVotes(track);
                voteButton.innerHTML = "Added";
                voteButton.disabled = true;
                voteButton.classList.add("voteBtnAdded");
            });
            
            /* indsætter text og knap i rækkerne */
            moodTrackRow.appendChild(moodTrackText);
            moodTrackRow.appendChild(voteButton);

            /* indsætter rækken i trackList div */
            moodTrackList.appendChild(moodTrackRow);
        });
    }
}




/* ADD SONG TO VOTES
Denne funktion gemmer en valgt sang i localStorage.

Sangen gemmes sammen med den aktuelle session_id.
Det betyder, at hver session har sin egen liste af valgte sange.

Eksempel:
Hvis session_id = 28,
så gemmes sangene under key'en:
votes_session_28
*/
/*
Formålet er:
1. At finde den session brugeren er i
2. At finde de votes/sange, der allerede er gemt for den session
3. At tjekke om sangen allerede er valgt
4. At gemme sangen i localStorage
5. Så myvotes.html senere kan hente og vise sangen
*/
export function addSongToVotes(song) {
  /* Henter session_id fra localStorage.

  session_id bliver gemt, når brugeren enten:
  - opretter en session i createsession.js
  - joiner en session i joinsession.js

  Eksempel:
  sessionId = "28"
  */
  const sessionId = localStorage.getItem("session_id");

  /* Hvis der ikke findes en session_id, betyder det at brugeren
  ikke er i en session endnu.

  Derfor stopper vi funktionen med return,
  så sangen ikke bliver gemt forkert.
  */
  if (!sessionId) {
    showError("You are not in a session.");
    return;
  }

  /* Her laver vi navnet på den localStorage-key,
  som sangene skal gemmes under.

  Vi bruger session_id i navnet, så hver session har sin egen liste.

  Eksempel:
  Hvis session_id = 28
  bliver votesKey = "votes_session_28"
  */
  const votesKey = `votes_session_${sessionId}`;

  /* Henter de sange, der allerede er valgt i denne session.

  localStorage gemmer kun tekst/string.
  Derfor bruger vi JSON.parse til at lave teksten om til et JavaScript-array igen.

  Hvis der ikke er gemt nogen sange endnu, bruger vi en tom liste [].
  */
  const votes = JSON.parse(localStorage.getItem(votesKey)) || [];

  /* Tjekker om sangen allerede findes i votes-listen.

  .some() går igennem listen og returnerer true,
  hvis mindst én sang matcher den sang, brugeren prøver at tilføje.

  Vi bruger både track_id og id, fordi sang-objekter kan have forskellige navne
  alt efter hvordan de kommer fra frontend/backend.

  Eksempel:
  song.track_id eller song.id
  */
  const alreadyChosen = votes.some((vote) => {
    return (vote.track_id || vote.id) === (song.track_id || song.id);
  });

  /* Hvis sangen allerede er valgt, viser vi en fejlbesked
  og stopper funktionen.

  Det forhindrer, at samme sang bliver tilføjet flere gange.
  */
  if (alreadyChosen) {
    showError("This song is already added to My Votes.");
    return;
  }

  /* Hvis sangen ikke allerede findes i listen,
  tilføjer vi sangen til votes-arrayet.
  */
  votes.push(song);

  /* Gemmer den opdaterede votes-liste i localStorage.

  JSON.stringify bruges, fordi localStorage kun kan gemme tekst.
  Derfor laver vi arrayet om til en string, før det gemmes.
  */
  localStorage.setItem(votesKey, JSON.stringify(votes));

  /* Logger i console, så vi kan tjekke at sangen faktisk bliver gemt */
  console.log("Song added to votes:", song);

  /* Logger hele vote-listen for den aktuelle session */
  console.log("Votes for session:", votes);
}
