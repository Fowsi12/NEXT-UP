import express from "express";
import { pool } from "../db/connect.js";

const db = pool();

const server = express();
const port = 3009;


server.use(express.static("frontend"));
server.use(express.json()); // Gør det muligt for serveren at læse JSON-data fra frontend, fx session_id ved join.
server.use(onEachRequest);

server.post('/api/sessions/join', onJoinSession);
server.post('/api/sessions/private', onCreatePrivateSession);
server.post('/api/sessions/shared', onCreateSharedSession);

server.get('/api/moods', onGetStartMoods); /* henter moods til mainpage */
server.get('/api/moods/tracks', onGetMoodTracks)/* henter sange til moods */

server.post("/api/sessions/:sessionId/queue", onAddTracksToQueue); /* Tilføjer sange til queue i sessionen */
server.get("/api/sessions/:sessionId/queue", onGetSessionQueue); /* Henter alle sange i queue for en bestemt session.  */

server.listen(port, onServerReady);

/* JOIN SESSION
Tager session_id fra frontend, søger efter sessionen i databasen
og sender enten sessionen tilbage eller en fejlbesked.
*/
async function onJoinSession(request, response) {
  const sessionId = parseInt(request.body.session_id);

  if (!sessionId) {
    return response.status(400).json({
      message: "Session ID is missing in database or is invalid",
    });
  }

  const dbResult = await db.query(`
    select  session_id,
            is_private,
            created_at
    from    sessions
    where   session_id = $1
    `,
    [sessionId]
  );

  if (dbResult.rows.length === 0) {
    return response.status(404).json({
      message: "Session was not found",
    });
  }

  response.json({
    message: "Session found",
    session: dbResult.rows[0],
  });
}

/* Opretter Private/Shared Session i databasen
returning * = giv mig den række, du lige har oprettet. 
Rækken leveres som en ordbog på index 0 i et array (derfor rows[0]). 
Rækken/ordbogen er det eneste element i array'et her. 
Uden returning * får man kun et tomt array tilbage.
Ellers kunne man køre en select lige efter insert, 
men det holder ikke, hvis en anden bruger også opretter en session i mellem... */
async function onCreatePrivateSession(request, response) {
  const dbResult = await db.query(`
    insert into sessions (is_private) values
    (true)
    returning *
  `);
  response.status(201).json(dbResult.rows[0]);
}
async function onCreateSharedSession(request, response) {
  const dbResult = await db.query(`
    insert into sessions (is_private) values
    (false)
    returning *
  `);
  response.status(201).json(dbResult.rows[0]);
}

/* Henter moods:
Funktion til moods, hvor vi henter alle moods fra vores database 
og sender dem som JSON til frontend.
*/
async function onGetStartMoods(request,response){
  const dbResult = await db.query(`
    select  mood_id as id, 
            title as mood 
    from    moods
    order by mood_id asc
    `); 
  response.json(dbResult.rows);
}
/* Henter alle tracks til hver mood:
Funktion til at hente alle tracks til hver mood fra db.
fletter moods og tracks sammen vha. join fra mood_id og track_id.
*/
async function onGetMoodTracks(request, response) {
  const dbResult = await db.query(`
    select  moods.mood_id,
            moods.title as mood,
            tracks.track_id,
            tracks.title as track_title,
            artists.stage_name as artist
    from    tracks_moods
    join    moods on tracks_moods.mood_id = moods.mood_id
    join    tracks on tracks_moods.track_id = tracks.track_id
    join    artists on tracks.artist_id = artists.artist_id
  `);
  response.json(dbResult.rows);
}


/* ADD TRACKS TO QUEUE / TRACKFLOW
Denne backend-funktion bliver kaldt, når brugeren trykker "Confirm votes" på myvotes.html.
Formålet er:
1. Frontend sender en liste af valgte sange til serveren
2. Serveren finder den session, brugeren er i
3. Serveren gemmer sangene i databasen i tabellen sessions_tracks
4. Tabellen sessions_tracks fungerer som den fælles afspilningskø (TrackFlow)
*/
async function onAddTracksToQueue(request, response) {
  /* 
  sessionId hentes fra URL'en. 
  Hvis frontend kalder "POST /api/sessions/12/queue"
  Så er: request.params.sessionId = "12"

  request.params er altid string. 
  Vi bruger parseInt() for at lave string "12" om til tallet 12.
  */
  const sessionId = parseInt(request.params.sessionId);
  /* 
  tracks hentes fra request body. Body er HTTP payloaden der kommer fra klienten. 
  Vi skal kun bruge track_id til databasen, 
  fordi track_title og artist allerede findes i tracks/artists-tabellerne.
  */
  const tracks = request.body.tracks;
  /* 
  Hvis sessionId mangler eller ikke kan laves til et gyldigt tal,
  stopper vi funktionen og sender en fejl tilbage til frontend.
  !sessionId svarer til undefined, Null eller 0. */
  if (!sessionId) {
    return response.status(400).json({
      message: "Session ID is missing or is invalid",
    });
  }

  /* if (!tracks):
  Her tjekker vi, om track faktisk har indhold og om array er tomt.
  Koden betyder: Hvis tracks ikke er en liste ELLER hvis listen er tom, så stop funktionen
  */
  if (!tracks || tracks.length === 0) {
    return response.status(400).json({
      message: "No tracks sent to TrackFlow",
    });
  }

  /* insertedTracks: 
  bruges til at gemme de rækker, 
  der faktisk bliver indsat i databasen.
  Den bruges til sidst, så frontend kan modtage,
  hvilke tracks der blev tilføjet til queue.
  */
  const insertedTracks = await Promise.all(

  /* VALG AF METODE TIL AT KØRE QUERIES?: 
  for...of: 
  Queries køres færdige en ad gangen. Sekventielt. 
  Vent på første query. Så næste. Så næste. 
  Vores database insert afhænger af vores select på existingTrack (tracks der allerede findes i køen)
  for...of er god når:
  * rækkefølge er vigtig
  * inserts afhænger af hinanden
  * undgå overload
  * stoppe ved evt. fejl

  Promise.all: 
  Det starter alle queries samtidig. Parallelt. 
  Promise.all venter så på, at alle queries er kørt færdige. 
  Promise.all er gåd når:
  * ting er uafhængige
  * man ønsker hastighed
  * rækkefølgen er ligegyldig
  * ønsker at indsætte mange uafhængige rows

  forEach(): 
  Vi kan ikke bruge forEach, fordi forEach venter ikke på await queries. 
  Det betyder, at serveren kan sende et samlet response til frontend, 
  FØR alle queries er færdige... 
  Dvs. vi risikerer, at den ikke når at finde hvilke tracks, der er i køen, 
  Inden vi indsætter tracks i køen. Og så går hele idéen i vasken. 
  */
 
    /* map():
    map laver et nyt array.
    Her laver vi et array af promises, som Promise.all kan vente på.
    */
    tracks.map(async function(track) { 
      /* trackId:
      Vi finder trackId for den aktuelle sang.
      Vi bruger defensive programming i tilfælde af fejl i data, hvor
      nogle objekter måske indeholder "track.track_id" og andre "track.id".
      Brug track.track_id hvis den findes. Ellers brug track.id.

      parseInt() laver string om til et tal, fordi databasen forventer et integer track_id.
      */
      const trackId = parseInt(track.track_id || track.id);
      /* if (!trackId):
      Hvis trackId ikke findes, leveres null, 
      men dette vil ikke være et problem før i fremtid fx hvis man tilføjer en sang uden et track.id.
      Lige nu har alle vores sange et track.id, men defensiv programmering skader ingen ;)  */
      if (!trackId) {
        return null;
      }
      /*
      Vi indsætter tracks hver gang brugeren trykker confirm.
      Eksempel: Hvis 3 brugere stemmer på track_id 8 i samme session, får vi 3 rækker i sessions_tracks med samme session_id og track_id. */
        const dbResult = await db.query(`
          insert into sessions_tracks (session_id, track_id)
          values ($1, $2)
          returning *
        `,
          [sessionId, trackId]
        );
        /* 
        Returnerer det indsatte track */
        return dbResult.rows[0];
    })
  );
  /* inserterdTracks kan nu indeholde et mix af tracks og null værdier. 
  Vi filtrerer null væk */
  const filteredTracks = [];
  let i = 0; 
  while (i < insertedTracks.length) {
    if (insertedTracks[i] !== null) {
      filteredTracks.push(insertedTracks[i]);
    }
    i++;
  }
  /* Svar sendes til frontend:
  For-of loopet er færdigt, sender vi et svar til frontend.
  
  status(201):
  201 betyder "Created" (Der er oprettet nye rækker i databasen).

  insertedTracks: liste med tracks, som er indsat. 
  */
  response.status(201).json({
    message: "Tracks added to the TrackFlow song queue",
    insertedTracks: filteredTracks,
  });
}


/* GET SESSION QUEUE:
Denne funktion henter alle sange i queue for en bestemt session.
Vi får session_id fra frontend. 
Vi joiner: sessions_tracks -> tracks -> artists
Så frontend får:
- session_id
- track_id
- track_title
- artist
- added_at
*/
async function onGetSessionQueue(request, response) {
  const sessionId = parseInt(request.params.sessionId);

  if (!sessionId) {
    return response.status(400).json({
      message: "Session ID mangler eller er ugyldigt.",
    });
  }

  const dbResult = await db.query(`
  select    sessions_tracks.session_id,
            tracks.track_id,
            tracks.title as track_title,
            artists.stage_name as artist,

            count(sessions_tracks.track_id) as vote_count,

            min(sessions_tracks.added_at) as first_added_at
  from      sessions_tracks
  join      tracks
    on      sessions_tracks.track_id = tracks.track_id
  join      artists
    on      tracks.artist_id = artists.artist_id
  where     sessions_tracks.session_id = $1
  group by  sessions_tracks.session_id,
            tracks.track_id,
            tracks.title,
            artists.stage_name
  order by  vote_count desc,
            first_added_at asc
  `,
    [sessionId]
  );

  response.json(dbResult.rows);
}






function onServerReady() {
  console.log("Webserver running on port", port);
}

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  request.db = db;
  next();
}


/* SKABELON TIL SQL OPSLAG VIA SERVER.JS
async function onGet...(request,response) {
const db = request.db;
  const ... = request.params. ...
  const dbResult = await db.query(`
   
    `,[...] 
  ); 
  response.json(dbResult.rows);
}
  */