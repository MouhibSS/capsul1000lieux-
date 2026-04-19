-- Drop existing tables if migrating
drop table if exists favorites cascade;
drop table if exists bookings cascade;
drop table if exists locations cascade;

-- Create full locations table
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  city text not null,
  country text not null,
  type text not null,
  description text,
  price numeric not null,
  currency text default '€',
  rating numeric,
  reviews integer default 0,
  area numeric,
  capacity integer,
  latitude numeric not null,
  longitude numeric not null,
  tags text[] default array[]::text[],
  amenities text[] default array[]::text[],
  fallback text,
  featured boolean default false,
  trending boolean default false,
  specs jsonb default '{}'::jsonb,
  image_urls text[] default array[]::text[],
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  total_price numeric not null,
  status text default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table favorites (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, location_id)
);

-- Row-Level Security
alter table locations enable row level security;
alter table bookings enable row level security;
alter table favorites enable row level security;

-- Locations: public read published, admin read all, admin write
create policy "Public can read published locations"
  on locations for select
  using (published = true);

create policy "Authenticated can read published locations"
  on locations for select
  using (published = true or auth.role() = 'authenticated');

create policy "Admins can read all locations"
  on locations for select
  using ((select auth.jwt() ->> 'user_role') = 'admin');

create policy "Admins can insert locations"
  on locations for insert
  with check ((select auth.jwt() ->> 'user_role') = 'admin');

create policy "Admins can update locations"
  on locations for update
  using ((select auth.jwt() ->> 'user_role') = 'admin');

-- Bookings
create policy "Users can read own bookings"
  on bookings for select
  using (user_id = auth.uid());

create policy "Users can create bookings"
  on bookings for insert
  with check (user_id = auth.uid());

-- Favorites
create policy "Users can read own favorites"
  on favorites for select
  using (user_id = auth.uid());

create policy "Users can insert favorites"
  on favorites for insert
  with check (user_id = auth.uid());

create policy "Users can delete own favorites"
  on favorites for delete
  using (user_id = auth.uid());
