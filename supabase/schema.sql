-- EmailCal schema with auth, teams, and team-scoped workspaces
-- Run this in your Supabase SQL editor if you need to reapply manually.

create extension if not exists pgcrypto;

-- ─── Teams + Profiles ────────────────────────────────────────────────────────
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists profiles (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  email            text not null unique,
  full_name        text not null default '',
  is_superadmin    boolean not null default false,
  current_team_id  uuid references teams(id) on delete set null,
  created_at       timestamptz not null default now()
);

create table if not exists team_members (
  team_id     uuid not null references teams(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member',
  created_at  timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists team_members_user_id_idx on team_members(user_id);

-- ─── Existing Workspace Tables ───────────────────────────────────────────────
create table if not exists segments (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams(id) on delete cascade,
  name        text not null,
  created_at  timestamptz default now()
);

create table if not exists campaigns (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams(id) on delete cascade,
  name        text not null,
  color       text not null default '#3b82f6',
  start_date  date not null,
  end_date    date not null,
  goal        text not null default '',
  segments    text[] not null default '{}',
  created_at  timestamptz default now()
);

create table if not exists emails (
  id           uuid primary key default gen_random_uuid(),
  team_id       uuid references teams(id) on delete cascade,
  subject      text not null,
  send_date    timestamptz not null,
  segment      text[] not null default '{}',
  campaign_id  uuid references campaigns(id) on delete cascade,
  email_type   text not null default 'Newsletter',
  status       text not null default 'Draft',
  owner        text not null default '',
  preview_text text not null default '',
  notes        text not null default '',
  created_at   timestamptz default now()
);

create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  team_id    uuid references teams(id) on delete cascade,
  email_id   uuid references emails(id) on delete cascade not null,
  author     text not null,
  body       text not null,
  created_at timestamptz default now()
);

alter table segments add column if not exists team_id uuid references teams(id) on delete cascade;
alter table campaigns add column if not exists team_id uuid references teams(id) on delete cascade;
alter table emails add column if not exists team_id uuid references teams(id) on delete cascade;
alter table comments add column if not exists team_id uuid references teams(id) on delete cascade;

alter table segments drop constraint if exists segments_name_key;
drop index if exists segments_name_key;
create unique index if not exists segments_team_id_name_idx on segments(team_id, name);
create index if not exists campaigns_team_id_idx on campaigns(team_id);
create index if not exists emails_campaign_id_idx on emails(campaign_id);
create index if not exists emails_send_date_idx on emails(send_date);
create index if not exists emails_team_id_idx on emails(team_id);
create index if not exists comments_email_id_idx on comments(email_id);
create index if not exists comments_team_id_idx on comments(team_id);

-- ─── Helper Functions ────────────────────────────────────────────────────────
create or replace function is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from profiles
    where user_id = auth.uid()
      and is_superadmin = true
  );
$$;

create or replace function user_belongs_to_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    is_superadmin()
    or exists (
      select 1
      from team_members
      where user_id = auth.uid()
        and team_id = target_team_id
    );
$$;

create or replace function seed_team_workspace(target_team_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  campaign_summer uuid := gen_random_uuid();
  campaign_onboarding uuid := gen_random_uuid();
  campaign_newsletter uuid := gen_random_uuid();
  email_newsletter uuid := gen_random_uuid();
begin
  insert into segments (team_id, name) values
    (target_team_id, 'All Subscribers'),
    (target_team_id, 'New Users'),
    (target_team_id, 'VIP Members'),
    (target_team_id, 'Inactive Users'),
    (target_team_id, 'Trial Users'),
    (target_team_id, 'Engaged Readers'),
    (target_team_id, 'Churned Users')
  on conflict (team_id, name) do nothing;

  insert into campaigns (id, team_id, name, color, start_date, end_date, goal, segments) values
    (campaign_summer, target_team_id, 'Summer Sale', '#3b82f6', '2026-05-01', '2026-05-31', 'Drive Q2 revenue', array['All Subscribers','VIP Members']),
    (campaign_onboarding, target_team_id, 'Onboarding Drip', '#8b5cf6', '2026-05-01', '2026-06-30', 'Activate new users', array['New Users','Trial Users']),
    (campaign_newsletter, target_team_id, 'Monthly Newsletter', '#10b981', '2026-05-01', '2026-12-31', 'Retain subscribers', array['All Subscribers','Engaged Readers']);

  insert into emails (team_id, subject, send_date, segment, campaign_id, email_type, status, owner, preview_text, notes) values
    (target_team_id, 'Summer Sale Starts Now — 40% Off Everything', '2026-05-07T10:00:00Z', array['All Subscribers','VIP Members'], campaign_summer, 'Promo', 'Sent', 'Alex', 'Our biggest sale of the year is here', ''),
    (target_team_id, 'Welcome to EmailCal — Getting Started', '2026-05-08T09:00:00Z', array['New Users'], campaign_onboarding, 'Drip', 'Sent', 'Jordan', 'Here is everything you need to know', ''),
    (target_team_id, 'May Newsletter — What''s New This Month', '2026-05-12T08:00:00Z', array['All Subscribers','Engaged Readers'], campaign_newsletter, 'Newsletter', 'Approved', 'Sam', 'Catch up on all the latest updates', 'Make sure to include the product roundup'),
    (target_team_id, 'Last Chance — Summer Sale Ends Sunday', '2026-05-16T11:00:00Z', array['All Subscribers'], campaign_summer, 'Promo', 'Scheduled', 'Alex', 'Don''t miss out on 40% off', ''),
    (target_team_id, 'Pro Tips: Get More from EmailCal', '2026-05-15T09:00:00Z', array['New Users','Trial Users'], campaign_onboarding, 'Drip', 'Review', 'Jordan', 'Power user features you might have missed', ''),
    (target_team_id, 'Exclusive: Members-Only Flash Sale', '2026-05-20T10:00:00Z', array['VIP Members'], campaign_summer, 'Promo', 'Draft', 'Alex', '24-hour access for our best customers', 'Needs design sign-off'),
    (target_team_id, 'Your Monthly Digest — May Edition', '2026-05-28T08:30:00Z', array['All Subscribers','Engaged Readers'], campaign_newsletter, 'Newsletter', 'Draft', 'Sam', 'Everything that happened in May', '');

  select id into email_newsletter
  from emails
  where team_id = target_team_id
    and subject = 'May Newsletter — What''s New This Month'
  limit 1;

  if email_newsletter is not null then
    insert into comments (team_id, email_id, author, body)
    values (target_team_id, email_newsletter, 'Alex', 'Can we add the case study link?');
  end if;
end;
$$;

create or replace function bootstrap_team_signup(p_team_name text, p_full_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_team_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select email into v_email from auth.users where id = v_user_id;

  insert into profiles (user_id, email, full_name, is_superadmin)
  values (
    v_user_id,
    coalesce(v_email, ''),
    coalesce(nullif(trim(p_full_name), ''), split_part(coalesce(v_email, ''), '@', 1)),
    lower(coalesce(v_email, '')) = 'datta.sagnik129@gmail.com'
  )
  on conflict (user_id) do update
  set email = excluded.email,
      full_name = excluded.full_name,
      is_superadmin = excluded.is_superadmin;

  select id into v_team_id
  from teams
  where slug = 'hcl-software-workspace'
  limit 1;

  if v_team_id is null then
    insert into teams (name, slug, created_by)
    values ('HCL Software Workspace', 'hcl-software-workspace', v_user_id)
    returning id into v_team_id;

    perform seed_team_workspace(v_team_id);
  end if;

  insert into team_members (team_id, user_id, role)
  values (
    v_team_id,
    v_user_id,
    case when lower(coalesce(v_email, '')) = 'datta.sagnik129@gmail.com' then 'owner' else 'member' end
  )
  on conflict (team_id, user_id) do nothing;

  update profiles
  set current_team_id = v_team_id
  where user_id = v_user_id;

  return v_team_id;
end;
$$;

drop function if exists rename_segment_in_campaigns(text, text);
create or replace function rename_segment_in_campaigns(p_team_id uuid, old_name text, new_name text)
returns void
language sql
as $$
  update campaigns
  set segments = array_replace(segments, old_name, new_name)
  where team_id = p_team_id
    and old_name = any(segments);
$$;

drop function if exists rename_segment_in_emails(text, text);
create or replace function rename_segment_in_emails(p_team_id uuid, old_name text, new_name text)
returns void
language sql
as $$
  update emails
  set segment = array_replace(segment, old_name, new_name)
  where team_id = p_team_id
    and old_name = any(segment);
$$;

grant execute on function is_superadmin() to authenticated;
grant execute on function user_belongs_to_team(uuid) to authenticated;
grant execute on function bootstrap_team_signup(text, text) to authenticated;
grant execute on function rename_segment_in_campaigns(uuid, text, text) to authenticated;
grant execute on function rename_segment_in_emails(uuid, text, text) to authenticated;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table segments enable row level security;
alter table campaigns enable row level security;
alter table emails enable row level security;
alter table comments enable row level security;

drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles
for select
using (auth.uid() = user_id or is_superadmin());

drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles
for insert
with check (
  auth.uid() = user_id
  and lower(email) = lower(coalesce(auth.jwt() ->> 'email', email))
  and is_superadmin = (lower(email) = 'datta.sagnik129@gmail.com')
);

drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles
for update
using (auth.uid() = user_id or is_superadmin())
with check (
  auth.uid() = user_id or is_superadmin()
);

drop policy if exists "teams_select" on teams;
create policy "teams_select" on teams
for select
using (user_belongs_to_team(id));

drop policy if exists "teams_insert" on teams;
create policy "teams_insert" on teams
for insert
with check (auth.uid() = created_by or is_superadmin());

drop policy if exists "team_members_select" on team_members;
create policy "team_members_select" on team_members
for select
using (auth.uid() = user_id or is_superadmin());

drop policy if exists "team_members_insert" on team_members;
create policy "team_members_insert" on team_members
for insert
with check (is_superadmin() or auth.uid() = user_id);

drop policy if exists "segments_select" on segments;
create policy "segments_select" on segments
for select
using (user_belongs_to_team(team_id));

drop policy if exists "segments_insert" on segments;
create policy "segments_insert" on segments
for insert
with check (user_belongs_to_team(team_id));

drop policy if exists "segments_update" on segments;
create policy "segments_update" on segments
for update
using (user_belongs_to_team(team_id))
with check (user_belongs_to_team(team_id));

drop policy if exists "campaigns_select" on campaigns;
create policy "campaigns_select" on campaigns
for select
using (user_belongs_to_team(team_id));

drop policy if exists "campaigns_insert" on campaigns;
create policy "campaigns_insert" on campaigns
for insert
with check (user_belongs_to_team(team_id));

drop policy if exists "campaigns_update" on campaigns;
create policy "campaigns_update" on campaigns
for update
using (user_belongs_to_team(team_id))
with check (user_belongs_to_team(team_id));

drop policy if exists "campaigns_delete" on campaigns;
create policy "campaigns_delete" on campaigns
for delete
using (user_belongs_to_team(team_id));

drop policy if exists "emails_select" on emails;
create policy "emails_select" on emails
for select
using (user_belongs_to_team(team_id));

drop policy if exists "emails_insert" on emails;
create policy "emails_insert" on emails
for insert
with check (user_belongs_to_team(team_id));

drop policy if exists "emails_update" on emails;
create policy "emails_update" on emails
for update
using (user_belongs_to_team(team_id))
with check (user_belongs_to_team(team_id));

drop policy if exists "emails_delete" on emails;
create policy "emails_delete" on emails
for delete
using (user_belongs_to_team(team_id));

drop policy if exists "comments_select" on comments;
create policy "comments_select" on comments
for select
using (user_belongs_to_team(team_id));

drop policy if exists "comments_insert" on comments;
create policy "comments_insert" on comments
for insert
with check (user_belongs_to_team(team_id));

drop policy if exists "comments_delete" on comments;
create policy "comments_delete" on comments
for delete
using (user_belongs_to_team(team_id));
