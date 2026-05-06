/* MAINPAGE
Dette js henter data til mainpage.
Det genererer en liste af moods, som mood-knapper oprettes efter.
*/


const response = await fetch('/api/moods')
console.log(response.status);
if (response.ok) {
    const moodsList = await response.json();
    console.log(moodsList);

const moodContainer = document.getElementById("moodcontainer");
moodContainer.innerHTML="";/*rydder containeren så der ikke bliver lavet dobbelt*/
moodsList.forEach(function(mood) {
    const div = document.createElement("div");/*laver en div rundt om knappen*/
    const button = document.createElement("button"); /*laver selveste knappen*/
    button.classList.add("openMoodBox");
    button.dataset.target= mood.mood.toLowerCase()+"Box";/*laver data box med navnene på moods*/
    const p = document.createElement("p");
    p.classList.add("moodButtonText");
    p.textContent=mood.mood;/*sætter tekst på knapperne*/
    button.appendChild(p);/*sætter p tagget ind i knappen*/ 
    button.addEventListener("click",function(){
            console.log("You Chose! ",mood.mood); /*skriver det valgte mood ind i konsollen*/ 
            console.log("Mood",mood.mood);
            const target = button.dataset.target;
            const moodBox = document.getElementById(target);
            if(moodBox){
                moodBox.classList.add("active");
            } else{
                console.log("Can't find moodBox",target);
            }
    });
    div.appendChild(button);/*sæter knappen ind i div'en*/
    moodContainer.appendChild(div);/* sætter div'en ind i moodcontainer*/
});
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