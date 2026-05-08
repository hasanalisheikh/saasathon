-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- PROJECTS
-- ─────────────────────────────────────────────
create table public.projects (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  brief           text,
  mode            text not null default 'solo' check (mode in ('solo', 'team')),
  due_date        date,
  target_grade    text,
  status          text not null default 'active' check (status in ('active', 'submitted', 'archived')),
  risk_score      integer not null default 0 check (risk_score between 0 and 100),
  risk_narrative  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- PROJECT MEMBERS
-- ─────────────────────────────────────────────
create table public.project_members (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  role        text not null default 'member' check (role in ('owner', 'member')),
  joined_at   timestamptz not null default now(),
  unique (project_id, user_id)
);

-- Auto-add owner as member on project creation
create or replace function public.handle_new_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute procedure public.handle_new_project();

-- ─────────────────────────────────────────────
-- RUBRIC CRITERIA
-- ─────────────────────────────────────────────
create table public.rubric_criteria (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  name          text not null,
  description   text,
  weight        numeric(5,2) not null default 0 check (weight between 0 and 100),
  status        text not null default 'uncovered' check (status in ('covered', 'partial', 'uncovered')),
  ai_extracted  boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- TASKS
-- ─────────────────────────────────────────────
create table public.tasks (
  id                   uuid primary key default gen_random_uuid(),
  project_id           uuid not null references public.projects(id) on delete cascade,
  rubric_criterion_id  uuid references public.rubric_criteria(id) on delete set null,
  title                text not null,
  description          text,
  owner_id             uuid references public.profiles(id) on delete set null,
  deadline             timestamptz,
  effort_hours         numeric(5,1),
  priority             text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status               text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  dependencies         uuid[] not null default '{}',
  ai_generated         boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- FOCUS CONTRACTS
-- ─────────────────────────────────────────────
create table public.focus_contracts (
  id                uuid primary key default gen_random_uuid(),
  task_id           uuid not null references public.tasks(id) on delete cascade,
  project_id        uuid not null references public.projects(id) on delete cascade,
  owner_id          uuid not null references public.profiles(id) on delete cascade,
  deadline          timestamptz not null,
  session_hours     numeric(4,1),
  proof_text        text,
  proof_url         text,
  ai_verdict        text check (ai_verdict in ('satisfied', 'partial', 'unsatisfied')),
  ai_verdict_reason text,
  status            text not null default 'active' check (status in ('active', 'completed', 'missed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- CHAT MESSAGES
-- ─────────────────────────────────────────────
create table public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  project_id      uuid not null references public.projects(id) on delete cascade,
  task_id         uuid references public.tasks(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  content         text not null,
  ai_flagged      boolean not null default false,
  ai_flag_reason  text,
  created_at      timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- RISK AUDITS (append-only history log)
-- ─────────────────────────────────────────────
create table public.risk_audits (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  score          integer not null check (score between 0 and 100),
  narrative      text not null,
  trigger_event  text not null,
  created_at     timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- UPDATED_AT TRIGGER (shared)
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger set_updated_at before update on public.focus_contracts
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.rubric_criteria enable row level security;
alter table public.tasks           enable row level security;
alter table public.focus_contracts enable row level security;
alter table public.chat_messages   enable row level security;
alter table public.risk_audits     enable row level security;

-- Helper: is the current user a member of a project?
create or replace function public.is_project_member(p_project_id uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Profiles: own row only
create policy "Users can view own profile"
  on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile"
  on public.profiles for update using (id = auth.uid());

-- Projects: members can read; owner can insert/update/delete
create policy "Project members can view project"
  on public.projects for select using (public.is_project_member(id));
create policy "Authenticated users can create projects"
  on public.projects for insert with check (owner_id = auth.uid());
create policy "Project owner can update project"
  on public.projects for update using (owner_id = auth.uid());
create policy "Project owner can delete project"
  on public.projects for delete using (owner_id = auth.uid());

-- Project members: readable by members
create policy "Project members can view membership"
  on public.project_members for select using (public.is_project_member(project_id));
create policy "Project owner can manage members"
  on public.project_members for all using (
    exists (select 1 from public.projects where id = project_id and owner_id = auth.uid())
  );

-- Rubric criteria, tasks, focus_contracts, chat_messages, risk_audits: project members only
create policy "Project members can view rubric criteria"
  on public.rubric_criteria for select using (public.is_project_member(project_id));
create policy "Project members can manage rubric criteria"
  on public.rubric_criteria for all using (public.is_project_member(project_id));

create policy "Project members can view tasks"
  on public.tasks for select using (public.is_project_member(project_id));
create policy "Project members can manage tasks"
  on public.tasks for all using (public.is_project_member(project_id));

create policy "Project members can view focus contracts"
  on public.focus_contracts for select using (public.is_project_member(project_id));
create policy "Project members can manage focus contracts"
  on public.focus_contracts for all using (public.is_project_member(project_id));

create policy "Project members can view chat"
  on public.chat_messages for select using (public.is_project_member(project_id));
create policy "Project members can send messages"
  on public.chat_messages for insert with check (
    public.is_project_member(project_id) and user_id = auth.uid()
  );

create policy "Project members can view risk audits"
  on public.risk_audits for select using (public.is_project_member(project_id));
create policy "Service role can insert risk audits"
  on public.risk_audits for insert with check (public.is_project_member(project_id));

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index on public.project_members (user_id);
create index on public.project_members (project_id);
create index on public.rubric_criteria (project_id);
create index on public.tasks (project_id);
create index on public.tasks (owner_id);
create index on public.tasks (rubric_criterion_id);
create index on public.focus_contracts (project_id);
create index on public.focus_contracts (owner_id);
create index on public.focus_contracts (task_id);
create index on public.chat_messages (project_id);
create index on public.chat_messages (task_id);
create index on public.risk_audits (project_id);
create index on public.risk_audits (created_at desc);
