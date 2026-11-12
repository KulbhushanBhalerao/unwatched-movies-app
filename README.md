# Unwatched

Search movies, see where to stream them, browse cast & facts, mark what you've seen, and filter for your next watch.

Stack: Next.js 15, TypeScript, Tailwind 4, Prisma + SQLite, TMDB API (streaming data via JustWatch).

## Setup
1. Get a free TMDB "API Read Access Token": https://www.themoviedb.org/settings/api
2. Edit `.env`: set `TMDB_TOKEN` and a long random `AUTH_SECRET`.
3. `npm install && npx prisma migrate deploy`
4. `npm run dev` → http://localhost:3000

Note: Node 18 needs Tailwind 4.1.x (pinned in package.json); newer 4.x requires a newer Node.
