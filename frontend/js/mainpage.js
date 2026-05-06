/* MAINPAGE
Dette js henter data til mainpage.
Det genererer en liste af moods, som mood-knapper oprettes efter.
*/


const response = await fetch('/api/moods')
console.log(response.status);
if (response.ok) {
    const moodsList = await response.json();
    console.log(moodsList);
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