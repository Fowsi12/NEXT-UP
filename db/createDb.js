import { connect } from "/connect.js";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

console.log('Dropping existing tables...');
await db.query('drop table if exists albums');
await db.query('drop table if exists artists');
await db.query('drop table if exists moods');
await db.query('drop table if exists tracks_moods');
await db.query('drop table if exists tracks');
await db.query('drop table if exists votes');
await db.query('drop table if exists users');
await db.query('drop table if exists sessions');
await db.query('drop table if exists sessions_tracks');


console.log('Creating tables...');
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
    unique (stage_name, nationality)
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
    milliseconds        integer         check (miliseconds >= 0)
  )
`);
await db.query /*VOTES*/ (`
  create table votes (
    vote_id             integer         unique not null,
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

console.log('Importing csv-data into tables...')
/*GODKENDT*/
await upload(db, 'db/albums.csv',`
    copy albums (album_id,artist_id,release_date,title)
    from stdin
    with csv header encoding 'UTF-8'
`);
/* GODKENDT*/
await upload(db, 'db/artists.csv',` 
    copy  artists (artist_id, stage_name, nationality)
    from  stdin
    with  csv encoding 'UTF-8'
    where nationality is not null
`);
/* GODKENDT */
await upload(db, 'db/moods.csv',`
    copy  moods (mood_id, title)
    from  stdin
    with  csv header encoding 'UTF-8'
`);
/* GODKENDT */
await upload(db, 'db/tracks.csv',`
    copy tracks (track_id, artist_id, album_id, title, miliseconds)
    from stdin
    with csv header encoding 'UTF-8'
`);
/* GODKENDT */
await upload(db, 'db/sessions.csv',`
    copy sessions (session_id, is_private, created_at)
    from stdin
    with csv header encoding 'UTF-8'
`);
/* GODKENDT */
await upload(db, 'db/users.csv', `
    copy users (user_id, session_id)
    from stdin
    with csv encoding 'UTF-8'
`);
/*GODKENDT*/
await upload(db, 'db/votes.csv', `
    copy votes (vote_id, session_id, user_id, track_id)
    from stdin
    with csv encoding 'UTF-8'
`);

/* 
await upload(db, 'db/sessions_tracks',`
    copy  sessions_tracks (session_track_id, session_id, track_id, added_at)
    from  stdin
    with  csv header encoding 'UTF-8'
`);
*/
/* 
await upload(db, 'db/tracks_moods',`
    copy  tracks_moods (track_id,mood_id)
    from  stdin
    with  csv header encoding 'UTF-8'
`);
*/

/* EKSEMPEL PÅ INSERT TIL UPLOAD NÅR VI GØRE DET I NÆSTE UGE
await db.query(`
    insert into tracks (track_id, album_id, media_type_id, genre_id, milliseconds, bytes, unit_price, title)
    select ID, Album, "Media type", Genre, "Duration in ms", "Size in bytes", "Price in USD", Title
    from   tracks_staging
    where  ("Price in USD" > 0.50 + 0.13 * ("Size in bytes" / 10000000.0))
    and    Album in (select album_id from albums)`,)
*/


await db.end();
console.log("Database successfully recreated.");