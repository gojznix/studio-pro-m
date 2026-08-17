# Music upload for admins

## Current state
The player is fully static: songs and ads come from hardcoded files (`src/data/songs.ts`, `src/data/advertisements.ts`), play counts live in localStorage, and there is no real audio playback — a timer just counts down 180s per track. The backend is empty: no tables, no storage buckets, no users.

## What we build

### 1. Backend foundation
- `profiles` table (id -> auth user id, email, display name) with an auto-create trigger on signup.
- `user_roles` table plus an `app_role` enum and a `has_role()` security-definer function (roles kept out of profiles for safety).
- `songs` table: title, artist, rating, storage path, duration, uploaded_by, created_at.
  - Public read (everyone hears the shared library), insert/update/delete restricted to admins.
- Private `songs` storage bucket for the audio files, with admin-only write and read access granted through signed URLs so files aren't openly hotlinkable.

### 2. Auth
- Email + password sign-in/sign-up at `/auth`, session listener wired at app level.
- The first account can be promoted to admin manually; afterwards admins can grant the role.
- Header shows sign-in / sign-out and an "Upload" link visible only to admins.

### 3. Upload page (`/upload`, admin-only)
- Protected route: redirects non-admins away.
- Form: audio file picker (mp3/wav, size limit), title, artist, rating (0-10 slider), validated with zod.
- Uploads the file to storage, then inserts the song row; shows progress and errors.
- Below the form: a list of uploaded songs with delete, so the library is manageable.

### 4. Player switches to the real library
- Player loads songs from the database instead of `src/data/songs.ts` (that file gets removed).
- Signed playback URLs are resolved per track and played through a real `<audio>` element, so duration and progress come from the actual file rather than a fixed 180s timer.
- Rating-weighted selection logic stays as it is; ads remain hardcoded for now.
- Empty state when no songs are uploaded yet.

## Notes
- Play tracking stays in localStorage for this step; moving it to the database can be a follow-up.
- Ads are untouched in this pass; an ad upload page can reuse the same pattern later.
