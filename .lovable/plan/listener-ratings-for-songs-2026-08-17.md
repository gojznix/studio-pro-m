# Listener ratings for songs

Let signed-in listeners rate each track 1-10. Once a song has enough listener votes, the listener average replaces the admin rating for playback selection.

## How it works for users

- Anyone can listen without an account.
- A 1-10 star row appears under the now-playing track. Signed out, it is disabled with a "Sign in to rate" hint linking to `/auth`.
- Signed-in users get one vote per song, changeable at any time. The stars show their own vote; the header shows the current effective rating and vote count.
- Any registered user can rate — no separate "listener" account type is needed. Everyone who signs up already gets a `user` identity; admins simply also hold the `admin` role. Adding a distinct account type would add sign-up friction without extra safety, since one-vote-per-user is already enforced by the database.

## Rating rules

- Scale: integers 1-10.
- Effective rating used by the player:
  - fewer than 3 listener votes -> admin `rating` (the seed value)
  - 3 or more votes -> listener average, rounded to one decimal
- The admin-entered rating stays editable on `/admin/music` and remains the fallback for new tracks.

## Technical work

**Database**
- New table `public.song_ratings`: `id`, `song_id` (references `songs`, cascade delete), `user_id`, `rating` int 1-10 with a CHECK, `created_at`, `updated_at`, unique on `(song_id, user_id)`.
- Grants: `SELECT, INSERT, UPDATE, DELETE` to `authenticated`; `SELECT` to `anon` (public averages); `ALL` to `service_role`.
- RLS: anyone may read; a user may insert/update/delete only rows where `user_id = auth.uid()`.
- View `public.song_rating_stats` (song_id, avg_rating, vote_count) with `security_invoker`, granted select to `anon` and `authenticated`, so aggregates load in one query.

**Frontend**
- `src/utils/library.ts`: join the stats view when fetching songs; compute `effectiveRating` per the rule above and expose `voteCount` plus the admin `rating`.
- `src/types/music.ts`: add `voteCount` and `effectiveRating` to `Song`.
- `src/utils/smartSelection.ts`: select on `effectiveRating` instead of `rating` (thresholds unchanged).
- New `src/components/SongRating.tsx`: 10-star interactive row, zinc/green theme, keyboard accessible, disabled + sign-in link when signed out, optimistic update with toast on failure.
- New `src/hooks/useSongRating.ts`: loads the current user's vote for a song, upserts on click, returns refreshed stats.
- `src/components/PlayerHeader.tsx`: show effective rating, vote count, and the rating row for songs only (never ads).
- Validate the submitted value as an integer 1-10 client-side before the upsert; the CHECK constraint enforces it server-side.
