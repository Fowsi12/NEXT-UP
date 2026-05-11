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

server.listen(port, onServerReady);

/* JOIN SESSION
Tager session_id fra frontend, søger efter sessionen i databasen
og sender enten sessionen tilbage eller en fejlbesked.
*/

async function onJoinSession(request, response) {
  const sessionId = Number(request.body.session_id);

  if (!sessionId) {
    return response.status(400).json({
      success: false,
      message: "Session ID mangler eller er ugyldigt.",
    });
  }

  const dbResult = await db.query(
    `
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
      success: false,
      message: "Session blev ikke fundet.",
    });
  }

  response.json({
    success: true,
    message: "Session fundet.",
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
$=antal argumenter til response
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