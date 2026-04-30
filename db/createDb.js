import { connect } from "/connect.js";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

await db.query /*ALBUMS*/ (`
  create table albums (
    album_id            integer        unique not null,
    artist_id           integer        not null references artists (artist_id),
    release_date        date,
    title               text,
  )
`);
await db.query /*ARTISTS*/(`
  create table artists (
      artist_id           integer         unique not null,
      stage_name          text            not null,
      nationality         char(2)         not null,
      unique (name, nationality)
  )
`);
await db.query /*GENRES*/(`
  create table genres (
      genre_id            integer         unique not null,
      title               text            not null,
  )
`);
await db.query /*MOODS*/(`
  create table moods (
      mood_id             integer         unique not null,
      title               text            not null,
  )
`);
await db.query /*TRACKS_MODS*/ (`
  create table tracks_moods (
      track_id            integer         references tracks (track_id),
      mood_id             integer         references moods (mood_id)
  )
`);
await db.query /*TRACKS*/ (`
  create table tracks (
      track_id            integer         unique not null,
      artist_id           integer         not null references artists (artist_id),
      album_id            integer         not null references albums (album_id),
      title               text            not null,
      miliseconds         integer         check (miliseconds >=0)
  )
`);
await db.query /*VOTES*/ (`
  create table votes (
      session_id          integer         not null references sessions (session_id),
      user_id             integer         not null references user (user_id),
      track_id            integer         not null references tracks (track_id)
  )
`);   
await db.query /*USERS*/ (`
  create table users (
    user_id             integer         unique not null,
    session_id          integer         not null,
  )
`);
await db.query /*SESSIONS*/ (`
  create table sessions (
      session_id          integer         unique not null,
      is_private          boolean         not null,
      created_at          timestamp,
  )
`)
await db.query /*SESSIONS_TRACKS*/ (`
  create table sessions_tracks (
      session_track_id    integer         unique not null,
      session_id          integer         not null,
      track_id            integer         not null,
      added_at            integer         not null,
  )
`)



console.log("server is running, creating database...");

console.log("Dropping existing tables...");

await db.end();
console.log("Database successfully recreated.");