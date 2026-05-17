create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_participation (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  paid boolean not null default false,
  payment_status text not null default 'unpaid',
  paid_at timestamptz,
  payment_provider text,
  payment_reference text,
  payment_id uuid,
  amount numeric,
  currency text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_participation_status_check
    check (status in ('draft', 'pending_payment', 'active', 'suspended', 'cancelled')),
  constraint user_participation_payment_status_check
    check (payment_status in ('unpaid', 'pending', 'approved', 'rejected', 'cancelled', 'refunded', 'expired'))
);

alter table public.user_participation add column if not exists id uuid default gen_random_uuid();
alter table public.user_participation add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.user_participation add column if not exists status text not null default 'draft';
alter table public.user_participation add column if not exists paid boolean not null default false;
alter table public.user_participation add column if not exists payment_status text not null default 'unpaid';
alter table public.user_participation add column if not exists paid_at timestamptz;
alter table public.user_participation add column if not exists payment_provider text;
alter table public.user_participation add column if not exists payment_reference text;
alter table public.user_participation add column if not exists payment_id uuid;
alter table public.user_participation add column if not exists amount numeric;
alter table public.user_participation add column if not exists currency text;
alter table public.user_participation add column if not exists created_at timestamptz default now();
alter table public.user_participation add column if not exists updated_at timestamptz default now();

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_code text not null default 'worldcup_prize_entry',
  provider text not null,
  provider_payment_id text,
  provider_order_id text,
  provider_preference_id text,
  provider_capture_id text,
  external_reference text,
  status text not null default 'pending',
  amount numeric not null,
  currency text not null,
  raw_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint payments_provider_check
    check (provider in ('mercadopago', 'paypal')),
  constraint payments_status_check
    check (status in ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'expired'))
);

alter table public.payments add column if not exists id uuid default gen_random_uuid();
alter table public.payments add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.payments add column if not exists product_code text not null default 'worldcup_prize_entry';
alter table public.payments add column if not exists provider text;
alter table public.payments add column if not exists provider_payment_id text;
alter table public.payments add column if not exists provider_order_id text;
alter table public.payments add column if not exists provider_preference_id text;
alter table public.payments add column if not exists provider_capture_id text;
alter table public.payments add column if not exists external_reference text;
alter table public.payments add column if not exists status text not null default 'pending';
alter table public.payments add column if not exists amount numeric;
alter table public.payments add column if not exists currency text;
alter table public.payments add column if not exists raw_payload jsonb;
alter table public.payments add column if not exists paid_at timestamptz;
alter table public.payments add column if not exists created_at timestamptz default now();
alter table public.payments add column if not exists updated_at timestamptz default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_participation_payment_id_fkey'
      and conrelid = 'public.user_participation'::regclass
  ) then
    alter table public.user_participation
      add constraint user_participation_payment_id_fkey
      foreign key (payment_id) references public.payments(id)
      on delete set null
      not valid;
  end if;

  alter table public.user_participation validate constraint user_participation_payment_id_fkey;
exception
  when duplicate_object then null;
  when others then null;
end $$;

create table if not exists public.prediction_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.prediction_entries add column if not exists id uuid default gen_random_uuid();
alter table public.prediction_entries add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.prediction_entries add column if not exists status text not null default 'draft';
alter table public.prediction_entries add column if not exists created_at timestamptz default now();
alter table public.prediction_entries add column if not exists updated_at timestamptz default now();

create table if not exists public.prediction_match_scores (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.prediction_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id bigint not null references public.matches(id) on delete cascade,
  home_goals integer not null,
  away_goals integer not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id),
  constraint prediction_match_scores_non_negative_check
    check (home_goals >= 0 and away_goals >= 0)
);

alter table public.prediction_match_scores add column if not exists id uuid default gen_random_uuid();
alter table public.prediction_match_scores add column if not exists entry_id uuid references public.prediction_entries(id) on delete cascade;
alter table public.prediction_match_scores add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.prediction_match_scores add column if not exists match_id bigint references public.matches(id) on delete cascade;
alter table public.prediction_match_scores add column if not exists home_goals integer not null default 0;
alter table public.prediction_match_scores add column if not exists away_goals integer not null default 0;
alter table public.prediction_match_scores add column if not exists created_at timestamptz default now();
alter table public.prediction_match_scores add column if not exists updated_at timestamptz default now();

create table if not exists public.prediction_specials (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid references public.prediction_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  top_scorer text,
  champion_team_id bigint references public.teams_info(id) on delete set null,
  runner_up_team_id bigint references public.teams_info(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.prediction_specials add column if not exists id uuid default gen_random_uuid();
alter table public.prediction_specials add column if not exists entry_id uuid references public.prediction_entries(id) on delete cascade;
alter table public.prediction_specials add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.prediction_specials add column if not exists top_scorer text;
alter table public.prediction_specials add column if not exists champion_team_id bigint references public.teams_info(id) on delete set null;
alter table public.prediction_specials add column if not exists runner_up_team_id bigint references public.teams_info(id) on delete set null;
alter table public.prediction_specials add column if not exists created_at timestamptz default now();
alter table public.prediction_specials add column if not exists updated_at timestamptz default now();

create table if not exists public.private_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  invite_code text unique not null,
  owner_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.private_groups add column if not exists id uuid default gen_random_uuid();
alter table public.private_groups add column if not exists name text;
alter table public.private_groups add column if not exists slug text;
alter table public.private_groups add column if not exists invite_code text;
alter table public.private_groups add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.private_groups add column if not exists created_at timestamptz default now();
alter table public.private_groups add column if not exists updated_at timestamptz default now();

create table if not exists public.private_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.private_groups(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id),
  constraint private_group_members_role_check
    check (role in ('owner', 'member'))
);

alter table public.private_group_members add column if not exists id uuid default gen_random_uuid();
alter table public.private_group_members add column if not exists group_id uuid references public.private_groups(id) on delete cascade;
alter table public.private_group_members add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.private_group_members add column if not exists role text default 'member';
alter table public.private_group_members add column if not exists joined_at timestamptz default now();

create unique index if not exists user_participation_user_id_unique on public.user_participation(user_id);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_provider_payment_id_idx on public.payments(provider, provider_payment_id);
create index if not exists payments_provider_order_id_idx on public.payments(provider, provider_order_id);
create index if not exists payments_external_reference_idx on public.payments(external_reference);
create index if not exists user_participation_user_id_idx on public.user_participation(user_id);
create unique index if not exists prediction_entries_user_id_unique on public.prediction_entries(user_id);
create index if not exists prediction_entries_user_id_idx on public.prediction_entries(user_id);
create unique index if not exists prediction_match_scores_user_match_unique on public.prediction_match_scores(user_id, match_id);
create index if not exists prediction_match_scores_user_match_idx on public.prediction_match_scores(user_id, match_id);
create unique index if not exists prediction_specials_user_id_unique on public.prediction_specials(user_id);
create index if not exists prediction_specials_user_id_idx on public.prediction_specials(user_id);
create index if not exists private_groups_owner_id_idx on public.private_groups(owner_id);
create unique index if not exists private_groups_invite_code_unique on public.private_groups(invite_code);
create index if not exists private_groups_invite_code_idx on public.private_groups(invite_code);
create unique index if not exists private_group_members_group_user_unique on public.private_group_members(group_id, user_id);
create index if not exists private_group_members_group_id_idx on public.private_group_members(group_id);
create index if not exists private_group_members_user_id_idx on public.private_group_members(user_id);

alter table public.profiles enable row level security;
alter table public.user_participation enable row level security;
alter table public.payments enable row level security;
alter table public.prediction_entries enable row level security;
alter table public.prediction_match_scores enable row level security;
alter table public.prediction_specials enable row level security;
alter table public.private_groups enable row level security;
alter table public.private_group_members enable row level security;

create or replace function public.is_private_group_member(group_id_input uuid, user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.private_group_members pgm
    where pgm.group_id = group_id_input
      and pgm.user_id = user_id_input
  );
$$;

grant execute on function public.is_private_group_member(uuid, uuid) to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can read own profile') then
    create policy "Users can read own profile" on public.profiles for select to authenticated using (id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_participation' and policyname = 'Users can read own participation') then
    create policy "Users can read own participation" on public.user_participation for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'payments' and policyname = 'Users can read own payments') then
    create policy "Users can read own payments" on public.payments for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_entries' and policyname = 'Users can read own prediction entries') then
    create policy "Users can read own prediction entries" on public.prediction_entries for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_entries' and policyname = 'Users can create own prediction entries') then
    create policy "Users can create own prediction entries" on public.prediction_entries for insert to authenticated with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_entries' and policyname = 'Users can update own draft prediction entries') then
    create policy "Users can update own draft prediction entries" on public.prediction_entries for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_match_scores' and policyname = 'Users can read own prediction scores') then
    create policy "Users can read own prediction scores" on public.prediction_match_scores for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_match_scores' and policyname = 'Users can create own prediction scores') then
    create policy "Users can create own prediction scores" on public.prediction_match_scores for insert to authenticated with check (user_id = auth.uid() and home_goals >= 0 and away_goals >= 0);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_match_scores' and policyname = 'Users can update own prediction scores') then
    create policy "Users can update own prediction scores" on public.prediction_match_scores for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and home_goals >= 0 and away_goals >= 0);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_specials' and policyname = 'Users can read own prediction specials') then
    create policy "Users can read own prediction specials" on public.prediction_specials for select to authenticated using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_specials' and policyname = 'Users can create own prediction specials') then
    create policy "Users can create own prediction specials" on public.prediction_specials for insert to authenticated with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'prediction_specials' and policyname = 'Users can update own prediction specials') then
    create policy "Users can update own prediction specials" on public.prediction_specials for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'private_groups' and policyname = 'Users can create owned private groups') then
    create policy "Users can create owned private groups" on public.private_groups for insert to authenticated with check (owner_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'private_groups' and policyname = 'Members can read private groups') then
    create policy "Members can read private groups" on public.private_groups for select to authenticated using (owner_id = auth.uid() or public.is_private_group_member(private_groups.id, auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'private_group_members' and policyname = 'Members can read private group members') then
    create policy "Members can read private group members" on public.private_group_members for select to authenticated using (user_id = auth.uid() or public.is_private_group_member(private_group_members.group_id, auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'private_group_members' and policyname = 'Owners can insert private group members') then
    create policy "Owners can insert private group members" on public.private_group_members for insert to authenticated with check (
      user_id = auth.uid()
      and role in ('owner', 'member')
      and exists (
        select 1
        from public.private_groups pg
        where pg.id = private_group_members.group_id
          and pg.owner_id = auth.uid()
      )
    );
  end if;
end $$;
