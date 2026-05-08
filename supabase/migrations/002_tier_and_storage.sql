-- ─────────────────────────────────────────────
-- TIER / FREEMIUM GATING
-- ─────────────────────────────────────────────
alter table public.profiles
  add column tier text not null default 'free'
    check (tier in ('free', 'pro', 'org'));

-- Track plan generation usage for free tier (3/month limit)
create table public.usage_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event_type  text not null, -- 'brief_generation' | 'submission_check'
  created_at  timestamptz not null default now()
);

create index on public.usage_events (user_id, event_type, created_at);

alter table public.usage_events enable row level security;

create policy "Users can view own usage"
  on public.usage_events for select using (user_id = auth.uid());
create policy "Users can insert own usage"
  on public.usage_events for insert with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- TEAM PULSE — contribution scoring
-- ─────────────────────────────────────────────
create table public.contribution_scores (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.projects(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  tasks_completed   integer not null default 0,
  contracts_done    integer not null default 0,
  contracts_missed  integer not null default 0,
  chat_messages     integer not null default 0,
  pin_of_shame      boolean not null default false,
  badge             text, -- 'rubric_rescuer' | 'focus_beast' | 'clutch_contributor' | 'deadline_saver'
  ai_narrative      text,
  computed_at       timestamptz not null default now(),
  unique (project_id, user_id)
);

create index on public.contribution_scores (project_id);

alter table public.contribution_scores enable row level security;

create policy "Project members can view scores"
  on public.contribution_scores for select using (public.is_project_member(project_id));
create policy "Project members can upsert scores"
  on public.contribution_scores for all using (public.is_project_member(project_id));

-- ─────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────

-- Brief PDFs (private — only project members)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'briefs',
  'briefs',
  false,
  10485760, -- 10MB
  array['application/pdf', 'text/plain']
)
on conflict (id) do nothing;

-- Submission drafts (private — only project members)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions',
  'submissions',
  false,
  20971520, -- 20MB
  array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
on conflict (id) do nothing;

-- RLS for storage: project members only
create policy "Project members can upload briefs"
  on storage.objects for insert
  with check (bucket_id = 'briefs' and auth.uid() is not null);

create policy "Project members can read briefs"
  on storage.objects for select
  using (bucket_id = 'briefs' and auth.uid() is not null);

create policy "Project members can upload submissions"
  on storage.objects for insert
  with check (bucket_id = 'submissions' and auth.uid() is not null);

create policy "Project members can read submissions"
  on storage.objects for select
  using (bucket_id = 'submissions' and auth.uid() is not null);

-- ─────────────────────────────────────────────
-- UPDATE types.ts REMINDER
-- After running this migration, regenerate types:
--   supabase gen types typescript --project-id <ref> > apps/web/lib/supabase/types.ts
-- ─────────────────────────────────────────────
