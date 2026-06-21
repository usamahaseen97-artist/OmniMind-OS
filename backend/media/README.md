# OmniStream media library

Drop your video files here (`.mp4`, `.webm`, `.mkv`, `.mov`, `.m4v`).

- Files are streamed from disk in 1 MB chunks via HTTP Range requests
  (`GET /api/v1/stream/{movie_id}`) — they are never loaded fully into memory.
- Subfolders become categories, e.g. `media/Hollywood/Movie.mp4` → category "Hollywood".
- The catalog is built from MongoDB (`movies` collection) when configured;
  otherwise it auto-scans this folder.

## Quick start (zero-config)
1. Put `BigBuckBunny.mp4` into this folder.
2. Start the backend, then call `POST /api/v1/movies/scan` (or just open OmniStream).
3. It appears as a card; click to play.

## With MongoDB
Set `MONGODB_URI` (or `MONGODB_USER/PASSWORD/HOST`) in `backend/.env`, then
`POST /api/v1/movies` with `{ "title": "...", "video_path": "Hollywood/Movie.mp4" }`.
The `video_path` is relative to this folder (absolute paths are also allowed).

> Override the location with the `OMNISTREAM_MEDIA_DIR` env var.
