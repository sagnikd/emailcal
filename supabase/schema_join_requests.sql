-- Join requests table
create table if not exists team_join_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references profiles(user_id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references profiles(user_id) on delete set null,
  unique(team_id, user_id)
);

-- Request to join a team (creates pending request; errors if already member or pending)
create or replace function request_to_join_team(p_team_id uuid)
returns void
language plpgsql security definer as $$
begin
  if exists (
    select 1 from team_members
    where team_id = p_team_id and user_id = auth.uid()
  ) then
    raise exception 'You are already a member of this team.';
  end if;

  insert into team_join_requests (team_id, user_id, status)
  values (p_team_id, auth.uid(), 'pending')
  on conflict (team_id, user_id) do update
    set status = 'pending', requested_at = now(), reviewed_at = null, reviewed_by = null
    where team_join_requests.status = 'rejected';
end;
$$;

-- Approve a join request (admin only: must be superadmin or member of team)
create or replace function approve_join_request(p_request_id uuid)
returns void
language plpgsql security definer as $$
declare
  v_team_id uuid;
  v_user_id uuid;
begin
  select team_id, user_id into v_team_id, v_user_id
  from team_join_requests where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'Request not found or already processed.';
  end if;

  -- Only superadmin or team members can approve
  if not (is_superadmin() or exists (
    select 1 from team_members where team_id = v_team_id and user_id = auth.uid()
  )) then
    raise exception 'Not authorized to approve this request.';
  end if;

  -- Add to team
  insert into team_members (team_id, user_id)
  values (v_team_id, v_user_id)
  on conflict do nothing;

  -- Update request
  update team_join_requests
  set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_request_id;

  -- Set their active team
  update profiles
  set current_team_id = v_team_id
  where user_id = v_user_id and current_team_id is null;
end;
$$;

-- Reject a join request (admin only)
create or replace function reject_join_request(p_request_id uuid)
returns void
language plpgsql security definer as $$
declare
  v_team_id uuid;
begin
  select team_id into v_team_id
  from team_join_requests where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'Request not found or already processed.';
  end if;

  if not (is_superadmin() or exists (
    select 1 from team_members where team_id = v_team_id and user_id = auth.uid()
  )) then
    raise exception 'Not authorized to reject this request.';
  end if;

  update team_join_requests
  set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_request_id;
end;
$$;

-- Get pending requests for teams the caller is a member of (or all if superadmin)
create or replace function get_pending_join_requests()
returns table (
  id uuid,
  team_id uuid,
  team_name text,
  user_id uuid,
  user_email text,
  user_full_name text,
  requested_at timestamptz
)
language plpgsql security definer as $$
begin
  return query
  select
    r.id,
    r.team_id,
    t.name as team_name,
    r.user_id,
    p.email as user_email,
    p.full_name as user_full_name,
    r.requested_at
  from team_join_requests r
  join teams t on t.id = r.team_id
  join profiles p on p.user_id = r.user_id
  where r.status = 'pending'
    and (
      is_superadmin()
      or exists (
        select 1 from team_members tm
        where tm.team_id = r.team_id and tm.user_id = auth.uid()
      )
    )
  order by r.requested_at asc;
end;
$$;

-- Get the current user's own join requests
create or replace function get_my_join_requests()
returns table (
  id uuid,
  team_id uuid,
  team_name text,
  status text,
  requested_at timestamptz,
  reviewed_at timestamptz
)
language plpgsql security definer as $$
begin
  return query
  select
    r.id,
    r.team_id,
    t.name as team_name,
    r.status,
    r.requested_at,
    r.reviewed_at
  from team_join_requests r
  join teams t on t.id = r.team_id
  where r.user_id = auth.uid()
  order by r.requested_at desc;
end;
$$;
