Music dataset generated for the uploaded schema.

Files included:
- artists.csv (100 rows)
- albums.csv (100 rows)
- tracks.csv (100 rows)
- moods.csv (6 rows)
- tracks_moods.csv (100 rows)
- sessions.csv (20 rows)
- users.csv (100 rows)
- sessions_tracks.csv (240 rows)
- votes.csv (100 rows)
- track_source_crosswalk.csv (100 rows)

How the data was built:
- Artists, albums and tracks are based on historical Spotify weekly top-chart data.
- IDs were converted to integers so the files match the uploaded SQL schema.
- One primary artist was used per track row.
- One representative artist was used per album row, so each album has exactly one artist_id.
- Referential integrity was checked across all foreign keys.
- Every track was assigned exactly one mood from:
  Energetic, Chill, Party, Happy, Romantic, Lounge

Notes:
- Column names follow the uploaded SQL file, including 'miliseconds'.
- Nationality values are stored as 2-character country codes.
