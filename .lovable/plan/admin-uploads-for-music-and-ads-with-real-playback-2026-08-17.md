# Admin uploads for music and ads, with real playback

## Current state
Everything in the player is fake. Songs live in `src/data/songs.ts` and ads in `src/data/advertisements.ts`, both hardcoded with `https://example.com/...` audio URLs. Nothing is ever played: `MusicPlayer.tsx` runs a countdown timer (fixed 180s for songs, `duration` for ads) and `ProgressIndicator` draws the bar from that timer. `AdBanner` ignores `bannerUrl` and renders a placeholder box. Play counts live in localStorage. The backend is empty — no tables, no storage buckets, no users.

## What we build

### 1. Backend foundation
- `profiles` table (linked to the auth user, email + display name) with an auto-create trigger on signup.
- `user_roles` table with an `app_role` enum and a `has_role()` security-definer function (roles kept out of profiles for safety).
- `songs` table: title, artist, rating, audio path, duration, uploaded_by, created_at.
- `advertisements` table: title, brand, audio path, banner image path, duration, magnitude (target plays per 24h), active flag, created_at.
- Both tables: public read (shared station), insert/update/delete for admins only.
- Storage buckets: `audio` (mp3 files, private, admin write, played via signed URLs) and `ad-banners` (public images).

### 2. Auth
- Email + password sign-up/sign-in at `/auth`, session listener wired at app level.
- Your account gets the admin role; further admins can be granted from the app later.
- Header shows sign-in/out plus admin-only links to the two upload pages.

### 3. Music upload page (`/admin/music`)
- Admin-only route.
- Form: mp3 file only (validated by extension and MIME type, with a size limit), title, artist, rating 0-10 — validated with zod.
- Duration read from the file in the browser before upload and stored with the row, so the player no longer guesses 180s.
- Uploads to storage, inserts the song row, shows progress and errors.
- List of existing songs below with delete (removes row and file).

### 4. Ads upload page (`/admin/ads`)
- Same admin-only pattern.
- Form: mp3 audio, optional banner image, title, brand, magnitude (target plays per 24h), active toggle. Duration read from the mp3.
- List of existing ads with active toggle and delete.

### 5. Real playback
- Replace the countdown simulation with a real `<audio>` element: play/pause/next drive the element, progress and time remaining come from `timeupdate`, and `ended` triggers auto-advance.
- Tracks resolve to signed storage URLs before playing.
- `ProgressIndicator` and `AdBanner` read the true duration; `AdBanner` shows the uploaded banner image when present.
- Player loads songs and ads from the database; `src/data/songs.ts` and `src/data/advertisements.ts` are removed. Rating-weighted song selection and ad-magnitude priority logic stay as they are, just fed by real data.
- Empty state when nothing has been uploaded yet, and a first-click unmute prompt since browsers block autoplay with sound.

## Notes
- Play tracking stays in localStorage for this step; moving counts to the database can be a follow-up.
- Only mp3 is accepted for both songs and ads, as requested.
