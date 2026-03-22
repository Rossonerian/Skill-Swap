-- Supabase schema for Skill Swap

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text,
  college text,
  branch text,
  year text,
  bio text,
  avatar_url text,
  skills_teach text[],
  skills_learn text[],
  is_profile_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references users(id) on delete cascade,
  user2_id uuid references users(id) on delete cascade,
  match_score int not null,
  match_type text not null,
  match_reasons text[],
  match_mutual_skills text[],
  match_one_way_for_user text[],
  match_one_way_from_user text[],
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id uuid references users(id) on delete cascade,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- stored procedures for convenience
create or replace function get_conversations_for_user(p_user_id uuid)
returns table (
  conversation_id uuid,
  match_id uuid,
  other_user_id uuid,
  other_user_name text,
  other_user_college text,
  last_message text,
  last_message_at timestamptz,
  unread_count int
)
language sql as $$
  select c.id, c.match_id,
    case when m.user1_id = p_user_id then m.user2_id else m.user1_id end as other_user_id,
    u.name as other_user_name,
    p.college as other_user_college,
    (select content from messages where conversation_id = c.id order by created_at desc limit 1) as last_message,
    (select created_at from messages where conversation_id = c.id order by created_at desc limit 1) as last_message_at,
    (select count(*) from messages where conversation_id = c.id and is_read = false and sender_id <> p_user_id) as unread_count
  from conversations c
  join matches m on m.id = c.match_id
  join users u on u.id = case when m.user1_id = p_user_id then m.user2_id else m.user1_id end
  left join profiles p on p.user_id = u.id
  where p_user_id in (m.user1_id, m.user2_id)
  order by last_message_at desc nulls last;
$$;

create or replace function get_matches_for_user(p_user_id uuid)
returns table (
  id uuid,
  user1_id uuid,
  user2_id uuid,
  match_score int,
  match_type text,
  status text,
  match_reasons text[],
  match_mutual_skills text[],
  match_one_way_for_user text[],
  match_one_way_from_user text[]
)
language sql as $$
  select * from matches where user1_id = p_user_id or user2_id = p_user_id order by match_score desc;
$$;

-- NOTE: A true generate_matches_for_user function belongs in app logic, not SQL.
create or replace function generate_matches_for_user(p_user_id uuid)
returns int
language plpgsql as $$
begin
  return 0;
end;
$$;
