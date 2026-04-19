-- Enable extensions
create extension if not exists "uuid-ossp";

-- Create tables
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  latitude numeric not null,
  longitude numeric not null,
  price_per_hour numeric not null,
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

-- Locations: public read on published, admin write
create policy "Public can read published locations"
  on locations for select
  using (published = true);

create policy "Admins can read all locations"
  on locations for select
  using ((select auth.jwt() ->> 'user_role') = 'admin');

create policy "Admins can insert locations"
  on locations for insert
  with check ((select auth.jwt() ->> 'user_role') = 'admin');

create policy "Admins can update locations"
  on locations for update
  using ((select auth.jwt() ->> 'user_role') = 'admin');

-- Bookings: users see their own
create policy "Users can read own bookings"
  on bookings for select
  using (user_id = auth.uid());

create policy "Users can create bookings"
  on bookings for insert
  with check (user_id = auth.uid());

-- Favorites: users manage own
create policy "Users can read own favorites"
  on favorites for select
  using (user_id = auth.uid());

create policy "Users can insert favorites"
  on favorites for insert
  with check (user_id = auth.uid());

create policy "Users can delete own favorites"
  on favorites for delete
  using (user_id = auth.uid());
