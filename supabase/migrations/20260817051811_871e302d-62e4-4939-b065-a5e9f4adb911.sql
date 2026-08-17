-- Remove foreign keys to auth.users per project guidelines
alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.user_roles drop constraint if exists user_roles_user_id_fkey;
alter table public.songs drop constraint if exists songs_uploaded_by_fkey;
alter table public.advertisements drop constraint if exists advertisements_uploaded_by_fkey;