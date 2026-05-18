create extension if not exists pgcrypto;

create table if not exists public.prediction_scoring_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prediction_id uuid,
  match_id text not null,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  actual_home_score integer not null,
  actual_away_score integer not null,
  points integer not null default 0,
  exact_score boolean not null default false,
  correct_outcome boolean not null default false,
  correct_goal_difference boolean not null default false,
  goal_error integer not null default 0,
  calculated_at timestamptz default now(),
  unique(user_id, match_id),
  constraint prediction_scoring_results_points_check check (points in (0, 3, 4, 5)),
  constraint prediction_scoring_results_scores_check check (
    predicted_home_score >= 0
    and predicted_away_score >= 0
    and actual_home_score >= 0
    and actual_away_score >= 0
    and goal_error >= 0
  )
);

alter table public.prediction_scoring_results add column if not exists id uuid default gen_random_uuid();
alter table public.prediction_scoring_results add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.prediction_scoring_results add column if not exists prediction_id uuid;
alter table public.prediction_scoring_results add column if not exists match_id text;
alter table public.prediction_scoring_results add column if not exists predicted_home_score integer;
alter table public.prediction_scoring_results add column if not exists predicted_away_score integer;
alter table public.prediction_scoring_results add column if not exists actual_home_score integer;
alter table public.prediction_scoring_results add column if not exists actual_away_score integer;
alter table public.prediction_scoring_results add column if not exists points integer default 0;
alter table public.prediction_scoring_results add column if not exists exact_score boolean default false;
alter table public.prediction_scoring_results add column if not exists correct_outcome boolean default false;
alter table public.prediction_scoring_results add column if not exists correct_goal_difference boolean default false;
alter table public.prediction_scoring_results add column if not exists goal_error integer default 0;
alter table public.prediction_scoring_results add column if not exists calculated_at timestamptz default now();

create unique index if not exists prediction_scoring_results_user_match_unique
  on public.prediction_scoring_results(user_id, match_id);

create index if not exists prediction_scoring_results_user_id_idx
  on public.prediction_scoring_results(user_id);

create index if not exists prediction_scoring_results_match_id_idx
  on public.prediction_scoring_results(match_id);

alter table public.prediction_scoring_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'prediction_scoring_results'
      and policyname = 'Users can read own scoring results'
  ) then
    create policy "Users can read own scoring results"
      on public.prediction_scoring_results
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;
end $$;
