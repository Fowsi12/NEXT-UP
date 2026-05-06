/* MAINPAGE
Dette js henter data til Mainpage.html
Det genererer en liste af moods, som mood-knapper oprettes efter.
*/
import { showError } from './ui_errorbox.js';
const errorBox = document.getElementById("errorBox");
/* errorBox:
viser fejltekst i en popup box der forsvinder af sig selv */

// TODO: pak nedenstående ind i en function der kaldes, når siden er loadet. 
// der er ingen founktion defineret - den kører blot fetch og if osv ud af det blå.
const moodContainer = document.getElementById("moodcontainer");
const response = await fetch('/api/moods')
console.log("Response: " + response.status);

if (response.ok) {
    const moodsList = await response.json();
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
        button.dataset.target = mood.mood.toLowerCase()+"Box";/*laver data box med navnene på moods*/
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
    div.appendChild(button);/*sæter knappen ind i div'en*/
    moodContainer.appendChild(div);/* sætter div'en ind i moodcontainer*/
    });
} else {
    console.log("error");
    showError("It was not possible to load any moods from the database!");
}



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