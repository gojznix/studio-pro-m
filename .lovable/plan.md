# Header links + making you an admin

## Current state (verified)

- The header already contains "Glasba" (`/admin/music`) and "Oglasi" (`/admin/ads`) links, but they render only when the signed-in user has the `admin` role.
- In the database there are three accounts. Only `testadmin@example.com` has the `admin` role. Your account `gojznik.b@gmail.com` has **no** role, so the links stay hidden for you.

## What to do

1. Grant the `admin` role to `gojznik.b@gmail.com` via a database migration (insert into the roles table for that user id).
2. Optionally clean up the test accounts' roles later — not part of this change.

After that, sign in with your account and the two links appear in the header automatically.

## Optional (say the word)

- Show the links to every signed-in user instead of admins only — not recommended, since the pages themselves are admin-protected and would just redirect.
- Add a small "Admin" label/group around the two links for clarity.

## Technical notes

- Migration: `insert into public.user_roles (user_id, role) values ('a09fee9b-6324-4b19-9d4a-4084051e766f', 'admin') on conflict do nothing;`
- No frontend changes needed; `useAdmin` reads the role through the existing `has_role` check.
