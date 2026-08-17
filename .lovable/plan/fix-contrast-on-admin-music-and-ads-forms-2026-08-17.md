# Fix contrast on admin music and ads forms

## Goal
Make text readable on the dark zinc admin upload forms (`/admin/music` and `/admin/ads`) by applying explicit light text colors.

## Changes
1. Audit form elements in `src/pages/AdminMusic.tsx` and `src/pages/AdminAds.tsx`.
2. Apply `text-white` to:
   - Section headings and card titles
   - Field labels
   - Input values and file input text
   - Button labels (where needed)
3. Apply `text-zinc-400` to:
   - Card descriptions
   - Helper/error context text that should remain muted
   - Empty-state messages
4. Keep error text as `text-red-400`.
5. Ensure no semantic tokens are left resolving to dark colors against dark zinc backgrounds.

## Verification
- Open `/admin/music` and `/admin/ads` in the preview.
- Confirm labels, input text, and descriptions are clearly visible against `bg-zinc-900`/`bg-zinc-800`.
- Run a production build to catch any class or type issues.
