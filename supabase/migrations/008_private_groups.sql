create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text,
  invite_code text unique not null,
  owner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references auth.users(id),
  role text default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

create index if not exists groups_owner_id_idx on public.groups(owner_id);
create index if not exists groups_invite_code_idx on public.groups(invite_code);
create index if not exists group_members_group_id_idx on public.group_members(group_id);
create index if not exists group_members_user_id_idx on public.group_members(user_id);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;

create or replace function public.is_group_member(group_id_input uuid, user_id_input uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members gm
    where gm.group_id = group_id_input
      and gm.user_id = user_id_input
  );
$$;

grant execute on function public.is_group_member(uuid, uuid) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'groups'
      and policyname = 'Authenticated users can create owned groups'
  ) then
    create policy "Authenticated users can create owned groups"
      on public.groups
      for insert
      to authenticated
      with check (owner_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'groups'
      and policyname = 'Members can view their groups'
  ) then
    create policy "Members can view their groups"
      on public.groups
      for select
      to authenticated
      using (
        owner_id = auth.uid()
        or public.is_group_member(groups.id, auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'group_members'
      and policyname = 'Members can view members of their groups'
  ) then
    create policy "Members can view members of their groups"
      on public.group_members
      for select
      to authenticated
      using (
        user_id = auth.uid()
        or public.is_group_member(group_members.group_id, auth.uid())
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'group_members'
      and policyname = 'Owners can add themselves to owned groups'
  ) then
    create policy "Owners can add themselves to owned groups"
      on public.group_members
      for insert
      to authenticated
      with check (
        user_id = auth.uid()
        and role in ('owner', 'member')
        and exists (
          select 1
          from public.groups g
          where g.id = group_members.group_id
            and g.owner_id = auth.uid()
        )
      );
  end if;
end $$;

create or replace function public.join_group_by_invite_code(invite_code_input text)
returns public.groups
language plpgsql
security definer
set search_path = public
as $$
declare
  target_group public.groups;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select *
  into target_group
  from public.groups
  where upper(invite_code) = upper(trim(invite_code_input))
  limit 1;

  if target_group.id is null then
    raise exception 'invalid_invite_code';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (target_group.id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return target_group;
end;
$$;

grant execute on function public.join_group_by_invite_code(text) to authenticated;
