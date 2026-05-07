/* MAINPAGE
Dette js henter data til Mainpage.html
Det genererer en liste af moods, som mood-knapper oprettes efter.
Når man trykker på en mood-knap, hentes 5 sange til den mood og vises i en popup box.
Hvis brugeren klikker på en anden mood-knap, lukker den forrige box og åbner den nye.
Hvis brugeren klikker på krydset i en box, lukker den boxen.
Hvis brugeren ikke synes om de 5 sange kan brugeren klikke på reset-knappen, og så hentes 5 nye sange til den mood.
*/

import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");
/* errorBox:
viser fejltekst i en popup box der forsvinder af sig selv */
const moodContainer = document.getElementById("moodcontainer");

/* OPEN MOOD BOXES */
let isMoodBoxOpen = null // variabel til at se, om MoodBox er åben eller lukket
console.log("isMoodBoxOpen: " + isMoodBoxOpen)
const moodBoxes = document.querySelectorAll(".moodBox");
/* .querySelectorAll:
finder alle elementer med class="closeMoodBox"
og returnerer en NodeList (liste med elementer) */

/* forEach: 
følgende gøres for hvert element i NodeList'en*/
document.addEventListener("click", function(event) {
/*moodBoxes.forEach:
Lukker evt. åbne Moodboxes, hvis man klipper på en anden*/
    const button = event.target.closest(".openMoodBox");
    if (button) {
        const targetBox = button.dataset.target;
        getTracksForMood(targetBox);
/* button.dataset.target:
const targetBox oprettes fra attributten "data-target" fra html 
I html har hver knap sit eget data-target, så de kan pege på forskellige classes*/
        const box = document.getElementById(targetBox);
        if (box) {
            box.style.display = "block";
            isMoodBoxOpen = true
            console.log("isMoodBoxOpen: " + isMoodBoxOpen)
        
        setTimeout(function () {
            box.style.opacity = "1";
            box.style.pointerEvents = "auto";
        }, 200);
    } else {
        console.log("Can't find moodBox",targetBox);
    }
    }
});
/* const box: 
Det er den box, som vi vil ændre på (åbne).
Den rammer vi vha. getElementById(targetBox). 
I stedet for (targetBox), kunne vi have skrevet en class på en box, 
men vi har 6 boxe, som skal åbnes med hver deres knap... 
På denne måde kan vi ramme alle 6 med én funktion*/

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
    console.log("isMoodBoxOpen: " + isMoodBoxOpen)
/* setTimeout: 
venter 500 ms inden boxen bliver helt skjult igen, 
fordi den har style="transition: opacity 0.5s"*/
}


/* MOOD BUTTONS GENERATOR */
let moodsList = [];
document.addEventListener("DOMContentLoaded", loadMoods);
async function loadMoods() {
    const response = await fetch('/api/moods') /* response = ordbog med moods */
    console.log("Response: " + response.status);
    
    if (response.ok) {
        const moodsList = await response.json(); /* laver response til const MoodList */
        console.log("Loaded list of moods from database:")
        console.log(moodsList);

        moodContainer.innerHTML=""; 
            /*moodContainer.innerHTML="";:
    En failsafe, der rydder containeren. 
    I tilfælde af at der allerede er indhold i den. 
    Så undgår vi, at den opretter contet 2 gange */
    
        moodsList.forEach(function(mood) {
            const div = document.createElement("div");/*laver en div rundt om knappen*/
            const button = document.createElement("button"); /*laver selveste knappen*/
            button.classList.add("openMoodBox");
            button.dataset.target = mood.mood.toLowerCase();/*laver data box med navnene på moods*/
            const p = document.createElement("p");
            p.classList.add("moodButtonText");
            p.textContent=mood.mood;/*sætter tekst på knapperne*/
            button.appendChild(p);/*sætter p tagget ind i knappen*/ 
            button.addEventListener("click",function(){
            console.log("You Chose: " + mood.mood + " mood!"); /*skriver det valgte mood ind i konsollen*/ 
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







        /* HENT 5 SANGE TIL HVER MOOD */
let allTracks = []; /* Laver et array til alle tracks */
document.addEventListener("DOMContentLoaded", loadTracksMoods);
async function loadTracksMoods() {
    const response = await fetch('/api/moods/tracks')/*henter tracks fra backend api*/    
    console.log("Response: " + response.status);
    if (response.ok) {
        allTracks = await response.json();
        console.log("Loaded list of tracks from database:")
        console.log(allTracks);
        let fiveSongs = getTracksForMood("")
        console.log("chill tjek")
    } else {
        console.log("error");
        showError("It was not possible to load any tracks from the database!");
    }
}
/* Funktion til at filtrerer tracks: 
Funktionen returner via et opslag på mood i den track parameter vi giver den
Og hvis mood === mood, tages track med i resultatet*/
function getTracksForMood(mood) {
    const moodTracks = allTracks.filter(function(track) {
        return track.mood.toLowerCase() === mood.toLowerCase(); 
    });
   

/*vi blander sangene tilfældigt*/ 
let mixedTracks = moodTracks.sort(function() { /*.sort bruger resultatet til at vælge rækkefølgen*/
    return Math.random() - 0.5; /* laver et tilfældigt tal mellem 0 og 1, og bruges til at blande listen*/
});
/*her tager vi de første 5 sange fra den blandede liste */
let fiveTracks = mixedTracks.slice(0, 5);

    return fiveTracks;
}



/*
ADD/TILFØJ SANGE TIL MYVOTES.HTML NÅR I ER FÆRDIGE MED AT HENTE SANGE TIL MOODBOXENE
function addSongToVotes(song) {
  const sessionId = localStorage.getItem("session_id");
  const votesKey = `votes_session_${sessionId}`;

  const votes = JSON.parse(localStorage.getItem(votesKey)) || [];

  const alreadyChosen = votes.some((vote) => {
    return (vote.track_id || vote.id) === (song.track_id || song.id);
  });

  if (alreadyChosen) {
    return;
  }

  votes.push(song);

  localStorage.setItem(votesKey, JSON.stringify(votes));
}

*/





/* MIKKELS MUSIKAPPLIKATION 
artists.js: 

const element = document.getElementById('content');
await loadAndRenderArtists(element);

async function loadAndRenderArtists(element) {
    element.textContent = 'Artists: Loading…';
    const response = await fetch('/api/artists');
    if (response.ok) {
        const artists = await response.json();
        renderArtists(artists, element);
    } else {
        element.textContent = 'Failed to load artists. Please try again later.';
    }
}

function renderArtists(artists, element) {
    element.textContent = `Artists: ${artists.length}`;
    const ul = document.createElement('ul');
    for (const artist of artists) {
        const li = document.createElement('li');
        renderArtist(artist, li);
        ul.appendChild(li);
    }
    element.appendChild(ul);
}

function renderArtist(artist, element) {
    const a = document.createElement('a');
    a.href = `artist.html?id=${artist.id}`;
    a.textContent = artist.stageName;
    element.appendChild(a);
}
*/