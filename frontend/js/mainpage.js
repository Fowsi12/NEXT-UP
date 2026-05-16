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
import { showError, showMessage } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");
const messageBox = document.getElementById("messageBox"); 

const moodContainer = document.getElementById("moodcontainer"); //container til mood knapper
let isMoodBoxOpen = null // variabel til at se, om MoodBox er åben eller lukket
let allTracks = []; /* variabel til alle tracks */
let sessionId /* variabel til session_id fra localStorage */
let votesKey /* variabel til den localStorage-key, som MyVotes skal gemmes under. */
let votes /* variabel til at gemme listen med brugerens midlertidige votes (som ikke er bekræftet endnu) */


// TODO: 
// Vis noget loading inden knapperne er dannet? 
// HVORFOR LOADER VI ALLE TRACKS OG MOODS NÅR SIDEN STARTES? 


/* HENT ALLE TRACKS & MOODS FRA DB */
document.addEventListener("DOMContentLoaded", loadTracks);
async function loadTracks() {
    /* await fetch:
    henter tracks fra backend via api
    await fetch giver ikke data med det samme. 
    Den returnerer et promise ("jeg er gået i gang med HTTP request, resultatet kommmer senere")
    Await fortæller at funktionen stopper indtil der kommer svar. 
    Men browseren kan stadig køre andre events*/
    const response = await fetch('/api/moods/tracks');
    console.log("Response:" + response.status);
    if (response.ok) {
        allTracks = await response.json();
        console.log("Loaded list of all tracks from database:", allTracks);
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
                    showError("Error: No menu exist for the chosen mood")
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
        if (!box) {
            return;
        }
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


/* getFiveTracks(tracksForMood): 
Funktion til at blande sange og returnere 5 
1. Funktionen tager tracksForMood som argument
2. Filtrerer sange fra, som brugeren allerede er stemt på (via MyVotes/localStorage)
3. Blander sangene i arrayet
4. Returnerer 5 sange som kan vises som forslag til brugeren */
// TODO: Spørg Mikkel om vi har en side-effekt her? Er det korrekt måde at slice et array på? // Lige nu: Hver gang vi kalder funktionen, skal vi gøre det med alle sange forfra for at vi ikke får biprodukt. 
function getFiveTracks(tracksForMood) {
    votes = getMyVotes();
    console.log("votes:", votes);
    /* Filtrering:
    Filtreringen tager elementerne(tracks) fra arrayet "votes" (fra localStorage), 
    og matcher dem én ad gangen med elementerne i arrayet "tracksForMood".
    Hvis der ikke findes et match bliver sangen pushed på det nye array. 
    Hvis der findes et match baseret på id, bliver sangen ikke pushed på det nye array. 
    *** Eksempel: ***
    - Er votes[0] === tracksForMood[0]? 
    - Hvis nej, forbliver alreadyVoted som false og sangen pushes på det nye array "tracksExclMyVotes". 
      Den går (pga. j++) videre til votes[1]. 
      Er der ikke flere votes, springer den gennem det første while loop med i-tælleren igennem uden at kigge på flere votes.
    - Hvis ja, sættes alreadyVoted=true, og j++, og sangen pushes ikke på det nye array "tracksExclMyVotes".
    */
    let tracksExclMyVotes = []; // nyt array til de tracks, som brugeren ikke har stemt på endnu
    let i = 0; // tæller til hvert element(track) til det valgte mood
    while (i < tracksForMood.length) { 
        let alreadyVoted = false; // variabel til at styre, om track skal pushes på det nye array eller ej
        let j = 0; // tæller til hvert element(track) til MyVotes listen
        while (j < votes.length && alreadyVoted === false) {
            if ((votes[j].track_id || votes[j].id) === (tracksForMood[i].track_id || tracksForMood[i].id)) {
                alreadyVoted = true; 
            }
            j++;
        }
        if (alreadyVoted === false) {
            tracksExclMyVotes.push(tracksForMood[i]);
        }
        i++;
    }
    
    if (tracksExclMyVotes.length === 0) {
    /* if(tracksExclMyVotes =[]):
    hvis alle de tracks, vi stiller til rådighed for det valgte mood matcher
    tracks, som findes i brugeres MyVotes liste, så viser vi en besked, 
    der fortæller, at brugeren har stemt på alle tracks til det valgte mood 
    return [], ellers fortsætter funktionen og shuffler indexes i et tomt array... hvilket ikke giver mening*/
        showMessage("You have already voted for all tracks in this mood")
        return [];
    }
    /* mixedTracks:
    Vi blander rækkefølgen på indexes i arrayet. 
    .sort: sorterer et array.
    .sort kigger på to indexes ad gangen og placerer dem. 
    fx numers.sort() sætter indexes fra lav til høj værdi. 
    Her siger vi, at den skal sorterer efter en funktion med math.random metode. 
    Math.random returnerer et tilfældigt decimaltal mellem 0 og 1. 
    Vi trækker 0.5 fra, så vi får tal mellem -0.5 og 0.5. 
    Hvis vi returnerer et negativt tal til .sort, sætter den [0] før [1]
    Hvis vi returnerer et positivt tal til .sort, sætter den [1] før [0]/bytter rækkefølgen.
    */
    const mixedTracks = tracksExclMyVotes.sort(function() {
        return Math.random() - 0.5; 
    });
    return mixedTracks.slice(0, 5);
    /* mixedTracks.slice:
    tager fra og med index 0 til 4 og returnerer */
}


/*GENERERE SANGELISTE TIL MOODBOXES*/
function renderTracks(tracks, box) {
    const moodTrackList = box.querySelector(".moodTrackList"); /* finder første element i vores boxes med class="moodTrackList" */
    moodTrackList.innerHTML = ""; /* rydder indholdet i elementet sange fra pop-up vinduet */
    
    if (tracks.length === 0) { /* hvis der ikke er mixed/shuffled nogen sange getFiveTracks funktionen */
        return;
    } else {
        tracks.forEach(function(track) {
            /* opretter én li pr. sang og tilføjer class="moodTrackRow" */
            const li = document.createElement("li");
            li.classList.add("moodTrackRow");
            
            /* opretter en text container, class="trackText" */          
            const trackText = document.createElement("div"); 
            trackText.classList.add("moodTrackText");

            /* 
            Indsætter sangens tekst.
            track.track_title kommer fra backend/server.js.
            track.artist_name virker kun, hvis backend også sender artist_name med.
            Hvis artist_name ikke findes endnu, viser vi "Unknown artist" i stedet for undefined. 
            */
            trackText.textContent = `${track.track_title || "Unknown track"} - ${track.artist || "Unknown artist"}`;
            
            /* opretter vote knap, class="voteBtn", indsætter billede */
            const voteButton = document.createElement("button");
            voteButton.className = "voteBtn CircleBtn";
            voteButton.title = "Add track to My Votes";
            voteButton.innerHTML = `<img src="images/vote_button.png" class="centerBtnImg">`;

            /* Kalder addTrackToVotes:
            Når brugeren klikker på vote-knappen ved en sang,
            kaldes addTrackToVotes funktionen, som gemmer sangen i localStorage
            */
            voteButton.addEventListener("click", function () {
                addTrackToVotes(track);
                voteButton.innerHTML = "Added";
                voteButton.disabled = true;
                voteButton.classList.add("voteBtnAdded");
                voteButton.style.cursor = "not-allowed"
            });
            
            /* indsætter text og knap i rækkerne */
            li.appendChild(trackText);
            li.appendChild(voteButton);

            /* indsætter rækken i trackList div */
            moodTrackList.appendChild(li);
        });
    }
}



/* ADD TRACK TO VOTES
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
2. At finde de tracks, som brugeren allerede har trykket Vote på, men ikke har bekræftet endnu (My Votes listen)
3. At forhindre sangen i at blive tilføjet 2 gange samtidig til MyVotes
4. At gemme sangen i localStorage, så myvotes.html senere kan hente og vise sangen
*/
export function addTrackToVotes(track) {
    votes = getMyVotes();

    /* alreadyVoted:
    Tjekker om sangen allerede findes i brugerens votes-liste fra LocalStorage.
    While loopet kører gennem elementerne i "votes". 
    Hvis den finder et match mellem track_id/id i votes og tracks, 
    ændres alreadyVoted stopper while loopet. 
    Vi bruger både track_id og id som en sikkerhed, hvis der skulle ske at opstå 
    forskellighed i data når udveksles mellem frontend/backend.
    */
    let alreadyVoted = false;
    let i = 0;
    while (i < votes.length && alreadyVoted === false) {
      if ((votes[i].track_id || votes[i].id) === (track.track_id || track.id)) {
          alreadyVoted = true;
      }
      i++;
    }

    if (alreadyVoted) {
      showError("This track has already been added to My Votes.");
      return;
    /* if (alreadyVoted): 
    Hvis sangen findes i votes fra localStorage, vises en fejlbesked,
    og funktionen stopper for at forhindre, sangen tilføjes flere gange. 
    */
    }

    /* votes.push(track):
    Sangen tilføjes til votes-arrayet.
    */
    votes.push(track);

    /* localStorage.setItem:
    Gemmer den opdaterede votes-liste i localStorage.
    JSON.stringify bruges, fordi localStorage kun kan gemme tekst.
    Derfor laver vi arrayet om til en string, før det gemmes.
    */
    localStorage.setItem(votesKey, JSON.stringify(votes));

    /* Logger i console, så vi kan tjekke at sangen faktisk bliver gemt */
    console.log("Song added to votes:", track);

    /* Logger hele vote-listen for den aktuelle session */
    console.log("Votes for session:", votes);
}

/* HENTER SANGE FRA MYVOTES LISTE SOM IKKE ER CONFIRMED ENDNU */
function getMyVotes() {
    /* Henter session_id fra localStorage.

    session_id bliver gemt, når brugeren enten:
    - opretter en session i createsession.js
    - joiner en session i joinsession.js

    Eksempel:
    sessionId = "28"
    */
    sessionId = localStorage.getItem("session_id");

    if (!sessionId) {
      showError("You are not in a session. Please create or join session again");
      return;
    /* if (!sessionId):
    Hvis der ikke findes en sesion_id, stopper vi funktionen med return
    Det er for at undgå at sangene bliver gemt forkert i LocalStorage*/
    }

    /* votesKey:
    Variabel til den localStorage-key, som MyVotes skal gemmes under.
    Vi bruger session_id i navnet, så hver session har sin egen liste.
    Eksempel:
    Hvis session_id = 28
    bliver votesKey = "votes_session_28"
    */
    votesKey = `votes_session_${sessionId}`;

    votes = JSON.parse(localStorage.getItem(votesKey)) || [];
    /* votes:
    Henter de sange, der allerede er valgt i denne session.
    localStorage gemmer kun tekst/string.
    Derfor bruger vi JSON.parse til at lave teksten om til et JavaScript-array igen.
    Hvis der ikke er gemt nogen sange endnu, bruger vi en tom liste [].
    */
    return votes;
}