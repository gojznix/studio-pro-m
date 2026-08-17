create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create policy "Users can read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to service_role;

create table public.songs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  rating numeric(3,1) not null check (rating >= 0 and rating <= 10),
  audio_path text not null,
  duration integer not null check (duration > 0),
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

grant select on public.songs to anon;
grant select, insert, update, delete on public.songs to authenticated;
grant all on public.songs to service_role;

alter table public.songs enable row level security;

create policy "Songs are publicly readable" on public.songs
  for select to anon using (true);

create policy "Songs are publicly readable for authenticated" on public.songs
  for select to authenticated using (true);

create policy "Admins can insert songs" on public.songs
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update songs" on public.songs
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete songs" on public.songs
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  audio_path text not null,
  banner_path text,
  duration integer not null check (duration > 0),
  magnitude integer not null default 0 check (magnitude >= 0),
  active boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

grant select on public.advertisements to anon;
grant select, insert, update, delete on public.advertisements to authenticated;
grant all on public.advertisements to service_role;

alter table public.advertisements enable row level security;

create policy "Ads are publicly readable" on public.advertisements
  for select to anon using (active = true);

create policy "Ads are publicly readable for authenticated" on public.advertisements
  for select to authenticated using (active = true);

create policy "Admins can insert ads" on public.advertisements
  for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update ads" on public.advertisements
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete ads" on public.advertisements
  for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', new.email));

  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin');
  end if;

  return new;
end;
$$;

grant execute on function public.handle_new_user() to service_role;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create policy "Allow public to read audio objects" on storage.objects
  for select to anon using (bucket_id = 'audio');

create policy "Allow authenticated to read audio objects" on storage.objects
  for select to authenticated using (bucket_id = 'audio');

create policy "Allow admin uploads to audio" on storage.objects
  for insert to authenticated with check (bucket_id = 'audio' and public.has_role(auth.uid(), 'admin'));

create policy "Allow admin updates to audio" on storage.objects
  for update to authenticated using (bucket_id = 'audio' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'audio' and public.has_role(auth.uid(), 'admin'));

create policy "Allow admin deletes from audio" on storage.objects
  for delete to authenticated using (bucket_id = 'audio' and public.has_role(auth.uid(), 'admin'));

create policy "Allow public to read banner objects" on storage.objects
  for select to anon using (bucket_id = 'ad-banners');

create policy "Allow authenticated to read banner objects" on storage.objects
  for select to authenticated using (bucket_id = 'ad-banners');

create policy "Allow admin uploads to banners" on storage.objects
  for insert to authenticated with check (bucket_id = 'ad-banners' and public.has_role(auth.uid(), 'admin'));

create policy "Allow admin updates to banners" on storage.objects
  for update to authenticated using (bucket_id = 'ad-banners' and public.has_role(auth.uid(), 'admin')) with check (bucket_id = 'ad-banners' and public.has_role(auth.uid(), 'admin'));

create policy "Allow admin deletes from banners" on storage.objects
  for delete to authenticated using (bucket_id = 'ad-banners' and public.has_role(auth.uid(), 'admin'));
