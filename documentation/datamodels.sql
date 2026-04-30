    COLUMN           DATATYPE       CONSTRAINTS

-- ALBUMS --
 create table albums (
    album_id            integer        unique not null,
    artist_id           integer        not null references artists (artist_id),
    release_date        date,
    title               text,
)
-- ARTISTS -- 
create table artists (
    artist_id           integer         unique not null,
    stage_name          text            not null,
    nationality         char(2)         not null,
    unique (name, nationality)
)
-- GENRES (er den nødvendig?) -- 
create table genres (
    genre_id            integer         unique not null,
    title               text            not null,
)
-- MOODS -- 
create table moods (
    mood_id             integer         unique not null,
    title               text            not null,
)
-- TRACKS & MOODS -- 
create table tracks_moods (
    track_id            integer         references tracks (track_id),
    mood_id             integer         references moods (mood_id)
)
-- TRACKS -- 
create table tracks (
    track_id            integer         unique not null,
    artist_id           integer         not null references artists (artist_id),
    album_id            integer         not null references albums (album_id),
    title               text            not null,
    miliseconds         integer         check (miliseconds >=0)
)
-- VOTES -- 
create table votes (
    session_id          integer         not null references sessions (session_id),
    user_id             integer         not null references user (user_id),
    track_id            integer         not null references tracks (track_id)
)
-- USERS --     
create table users (
    user_id             integer         unique not null,
    session_id          integer         not null,
)
-- SESSIONS -- 
create table sessions (
    session_id          integer         unique not null,
    is_private          boolean         not null,
    created_at          timestamp,
)
-- SESSIONS_TRACKS -- 
create table sessions_tracks (
    session_track_id    integer         unique not null,
    session_id          integer         not null,
    track_id            integer         not null,
    added_at            integer         not null,
)

