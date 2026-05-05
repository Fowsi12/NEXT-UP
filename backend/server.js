import express from "express";
import { pool } from "../db/connect.js";

const db = pool();

const server = express();
const port = 3009;

server.use(express.static("frontend"));
server.use(onEachRequest);
server.get('/api/moods', onGetStartMoods);
server.listen(port, onServerReady);

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
    `,); 
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