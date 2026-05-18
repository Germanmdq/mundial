alter table public.prediction_match_scores
  add column if not exists completed boolean not null default true;

alter table public.prediction_match_scores
  add column if not exists updated_at timestamptz default now();

create unique index if not exists prediction_match_scores_user_match_unique
  on public.prediction_match_scores(user_id, match_id);

create index if not exists prediction_match_scores_user_completed_idx
  on public.prediction_match_scores(user_id, completed);

alter table public.private_groups
  add column if not exists updated_at timestamptz default now();

create unique index if not exists private_groups_invite_code_unique
  on public.private_groups(invite_code);

create unique index if not exists private_group_members_group_user_unique
  on public.private_group_members(group_id, user_id);
