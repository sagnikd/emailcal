-- EmailCal schema
-- Run this in your Supabase SQL editor: https://supabase.com/dashboard → SQL Editor

-- ─── Segments ────────────────────────────────────────────────────────────────
create table if not exists segments (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  created_at  timestamptz default now()
);

-- ─── Campaigns ───────────────────────────────────────────────────────────────
create table if not exists campaigns (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  color       text not null default '#3b82f6',
  start_date  date not null,
  end_date    date not null,
  goal        text not null default '',
  segments    text[] not null default '{}',
  created_at  timestamptz default now()
);

-- ─── Emails ──────────────────────────────────────────────────────────────────
create table if not exists emails (
  id           uuid primary key default gen_random_uuid(),
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

-- ─── Comments ────────────────────────────────────────────────────────────────
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  email_id   uuid references emails(id) on delete cascade not null,
  author     text not null,
  body       text not null,
  created_at timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists emails_campaign_id_idx on emails(campaign_id);
create index if not exists emails_send_date_idx   on emails(send_date);
create index if not exists comments_email_id_idx  on comments(email_id);

-- ─── RLS (disable for now; enable + add policies for production auth) ─────────
alter table segments  disable row level security;
alter table campaigns disable row level security;
alter table emails    disable row level security;
alter table comments  disable row level security;

create or replace function rename_segment_in_campaigns(old_name text, new_name text)
returns void
language sql
as $$
  update campaigns
  set segments = array_replace(segments, old_name, new_name)
  where old_name = any(segments);
$$;

create or replace function rename_segment_in_emails(old_name text, new_name text)
returns void
language sql
as $$
  update emails
  set segment = array_replace(segment, old_name, new_name)
  where old_name = any(segment);
$$;

-- ─── Seed data ───────────────────────────────────────────────────────────────
insert into segments (name) values
  ('All Subscribers'),
  ('New Users'),
  ('VIP Members'),
  ('Inactive Users'),
  ('Trial Users'),
  ('Engaged Readers'),
  ('Churned Users')
on conflict (name) do nothing;

insert into campaigns (id, name, color, start_date, end_date, goal, segments) values
  ('00000000-0000-0000-0000-000000000001', 'Summer Sale',        '#3b82f6', '2026-05-01', '2026-05-31', 'Drive Q2 revenue',    array['All Subscribers','VIP Members']),
  ('00000000-0000-0000-0000-000000000002', 'Onboarding Drip',    '#8b5cf6', '2026-05-01', '2026-06-30', 'Activate new users',  array['New Users','Trial Users']),
  ('00000000-0000-0000-0000-000000000003', 'Monthly Newsletter', '#10b981', '2026-05-01', '2026-12-31', 'Retain subscribers',  array['All Subscribers','Engaged Readers'])
on conflict (id) do nothing;

with inserted_emails as (
  insert into emails (id, subject, send_date, segment, campaign_id, email_type, status, owner, preview_text, notes) values
    ('10000000-0000-0000-0000-000000000001', 'Summer Sale Starts Now — 40% Off Everything', '2026-05-07T10:00:00Z', array['All Subscribers','VIP Members'],   '00000000-0000-0000-0000-000000000001', 'Promo',      'Sent',      'Alex',   'Our biggest sale of the year is here',      ''),
    ('10000000-0000-0000-0000-000000000002', 'Welcome to EmailCal — Getting Started',        '2026-05-08T09:00:00Z', array['New Users'],                        '00000000-0000-0000-0000-000000000002', 'Drip',       'Sent',      'Jordan', 'Here is everything you need to know',       ''),
    ('10000000-0000-0000-0000-000000000003', 'May Newsletter — What''s New This Month',      '2026-05-12T08:00:00Z', array['All Subscribers','Engaged Readers'], '00000000-0000-0000-0000-000000000003', 'Newsletter', 'Approved',  'Sam',    'Catch up on all the latest updates',        'Make sure to include the product roundup'),
    ('10000000-0000-0000-0000-000000000004', 'Last Chance — Summer Sale Ends Sunday',        '2026-05-16T11:00:00Z', array['All Subscribers'],                   '00000000-0000-0000-0000-000000000001', 'Promo',      'Scheduled', 'Alex',   'Don''t miss out on 40% off',                ''),
    ('10000000-0000-0000-0000-000000000005', 'Pro Tips: Get More from EmailCal',             '2026-05-15T09:00:00Z', array['New Users','Trial Users'],           '00000000-0000-0000-0000-000000000002', 'Drip',       'Review',    'Jordan', 'Power user features you might have missed', ''),
    ('10000000-0000-0000-0000-000000000006', 'Exclusive: Members-Only Flash Sale',           '2026-05-20T10:00:00Z', array['VIP Members'],                       '00000000-0000-0000-0000-000000000001', 'Promo',      'Draft',     'Alex',   '24-hour access for our best customers',     'Needs design sign-off'),
    ('10000000-0000-0000-0000-000000000007', 'Your Monthly Digest — May Edition',            '2026-05-28T08:30:00Z', array['All Subscribers','Engaged Readers'], '00000000-0000-0000-0000-000000000003', 'Newsletter', 'Draft',     'Sam',    'Everything that happened in May',           '')
  on conflict (id) do nothing
  returning id
)
insert into comments (email_id, author, body) values
  ('10000000-0000-0000-0000-000000000003', 'Alex', 'Can we add the case study link?')
on conflict do nothing;
