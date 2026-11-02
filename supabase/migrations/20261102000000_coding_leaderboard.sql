create table if not exists public.coding_leaderboard (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  solved_count integer not null default 0 check (solved_count >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  xp integer not null default 0 check (xp >= 0),
  badge text not null default 'Rising Coder'
    check (badge in ('Rising Coder', 'Bronze Coder', 'Silver Bug Slayer', 'Gold Algorithmist')),
  updated_at timestamptz not null default now()
);

alter table public.coding_leaderboard enable row level security;

grant select on public.coding_leaderboard to anon, authenticated;
grant insert, update on public.coding_leaderboard to authenticated;

drop policy if exists "Anyone can read coding leaderboard" on public.coding_leaderboard;
create policy "Anyone can read coding leaderboard"
on public.coding_leaderboard
for select
to anon, authenticated
using (true);

drop policy if exists "Students can insert their own coding score" on public.coding_leaderboard;
create policy "Students can insert their own coding score"
on public.coding_leaderboard
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Students can update their own coding score" on public.coding_leaderboard;
create policy "Students can update their own coding score"
on public.coding_leaderboard
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
