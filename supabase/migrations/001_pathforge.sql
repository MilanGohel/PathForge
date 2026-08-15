-- Pathforge v0 schema
-- Run in Supabase SQL editor or via CLI: supabase db push

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Pack templates (readable by authenticated users)
create table if not exists public.pack_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  intake_defaults jsonb not null default '{}'::jsonb,
  diagnostic_bank jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.pack_templates enable row level security;

create policy "packs_select_authenticated"
  on public.pack_templates for select
  to authenticated
  using (true);

-- Paths
create table if not exists public.paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('pack', 'prompt')),
  pack_slug text,
  topic text not null,
  goal text not null,
  hours_per_week numeric not null default 5,
  deadline date,
  title text,
  summary text,
  est_hours numeric,
  status text not null default 'draft'
    check (status in ('draft', 'diagnostic', 'generating_l0', 'ready', 'error')),
  domain_alert text,
  diagnostic_result jsonb,
  l0_payload jsonb,
  is_active boolean not null default true,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists paths_user_id_idx on public.paths (user_id);
create index if not exists paths_user_active_idx on public.paths (user_id, is_active);

alter table public.paths enable row level security;

create policy "paths_all_own"
  on public.paths for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stages
create table if not exists public.stages (
  id uuid primary key default gen_random_uuid(),
  path_id uuid not null references public.paths (id) on delete cascade,
  position int not null,
  title text not null,
  summary text not null default '',
  est_hours numeric,
  l1_status text not null default 'pending'
    check (l1_status in ('pending', 'generating', 'ready', 'error')),
  l1_payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  unique (path_id, position)
);

create index if not exists stages_path_id_idx on public.stages (path_id);

alter table public.stages enable row level security;

create policy "stages_all_own"
  on public.stages for all
  using (
    exists (
      select 1 from public.paths p
      where p.id = stages.path_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.paths p
      where p.id = stages.path_id and p.user_id = auth.uid()
    )
  );

-- Modules
create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.stages (id) on delete cascade,
  position int not null,
  title text not null,
  blurb text not null default '',
  est_minutes int,
  l2_status text not null default 'pending'
    check (l2_status in ('pending', 'generating', 'ready', 'error')),
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (stage_id, position)
);

create index if not exists modules_stage_id_idx on public.modules (stage_id);

alter table public.modules enable row level security;

create policy "modules_all_own"
  on public.modules for all
  using (
    exists (
      select 1
      from public.stages s
      join public.paths p on p.id = s.path_id
      where s.id = modules.stage_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.stages s
      join public.paths p on p.id = s.path_id
      where s.id = modules.stage_id and p.user_id = auth.uid()
    )
  );

-- Lessons (one per module)
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null unique references public.modules (id) on delete cascade,
  cards jsonb not null default '[]'::jsonb,
  generated_at timestamptz not null default now()
);

alter table public.lessons enable row level security;

create policy "lessons_all_own"
  on public.lessons for all
  using (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = lessons.module_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = lessons.module_id and p.user_id = auth.uid()
    )
  );

-- Resources
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  url text not null,
  kind text not null default 'article'
    check (kind in ('article', 'video', 'book', 'other')),
  provider text,
  snippet text,
  verified boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists resources_module_id_idx on public.resources (module_id);

alter table public.resources enable row level security;

create policy "resources_all_own"
  on public.resources for all
  using (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = resources.module_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = resources.module_id and p.user_id = auth.uid()
    )
  );

-- Module notes
create table if not exists public.module_notes (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  body text not null default '',
  updated_at timestamptz not null default now(),
  unique (module_id, user_id)
);

alter table public.module_notes enable row level security;

create policy "notes_all_own"
  on public.module_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Quiz items
create table if not exists public.quiz_items (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  position int not null default 0,
  prompt text not null,
  choices jsonb not null default '[]'::jsonb,
  correct_index int not null default 0,
  explanation text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists quiz_items_module_id_idx on public.quiz_items (module_id);

alter table public.quiz_items enable row level security;

create policy "quiz_items_all_own"
  on public.quiz_items for all
  using (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = quiz_items.module_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.modules m
      join public.stages s on s.id = m.stage_id
      join public.paths p on p.id = s.path_id
      where m.id = quiz_items.module_id and p.user_id = auth.uid()
    )
  );

-- Quiz attempts (optional; never gates completion)
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_item_id uuid not null references public.quiz_items (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  choice_index int not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_all_own"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tutor
create table if not exists public.tutor_threads (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (module_id, user_id)
);

alter table public.tutor_threads enable row level security;

create policy "tutor_threads_all_own"
  on public.tutor_threads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.tutor_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.tutor_threads (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists tutor_messages_thread_id_idx on public.tutor_messages (thread_id);

alter table public.tutor_messages enable row level security;

create policy "tutor_messages_all_own"
  on public.tutor_messages for all
  using (
    exists (
      select 1 from public.tutor_threads t
      where t.id = tutor_messages.thread_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tutor_threads t
      where t.id = tutor_messages.thread_id and t.user_id = auth.uid()
    )
  );

-- Generation budget / audit
create table if not exists public.generation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  level text not null,
  entity_id uuid,
  ok boolean not null default true,
  error_message text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists generation_events_user_day_idx
  on public.generation_events (user_id, created_at desc);

alter table public.generation_events enable row level security;

create policy "generation_events_select_own"
  on public.generation_events for select
  using (auth.uid() = user_id);

create policy "generation_events_insert_own"
  on public.generation_events for insert
  with check (auth.uid() = user_id);

-- Seed AI Engineering pack metadata (content still AI-generated at runtime)
insert into public.pack_templates (slug, title, description, intake_defaults, diagnostic_bank)
values (
  'ai-engineering',
  'AI Engineering',
  'Build real AI systems: foundations, ML intuition, LLMs, RAG, agents, and production habits.',
  '{"topic":"AI Engineering","goal":"Become productive building AI-powered products (agents, RAG, applied ML)","hoursPerWeek":6}'::jsonb,
  '[]'::jsonb
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  intake_defaults = excluded.intake_defaults;
