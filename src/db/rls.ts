/**
 * Supabase RLS + auth trigger SQL applied after drizzle-kit table migrations.
 * Kept as a TypeScript string source (not a hand-authored drizzle migration file).
 * Applied by: pnpm db:rls
 */
export const RLS_SQL = `
-- Profiles policies
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

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

-- Pack templates
alter table public.pack_templates enable row level security;

drop policy if exists "packs_select_authenticated" on public.pack_templates;
create policy "packs_select_authenticated"
  on public.pack_templates for select
  to authenticated
  using (true);

-- Paths
alter table public.paths enable row level security;

drop policy if exists "paths_all_own" on public.paths;
create policy "paths_all_own"
  on public.paths for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Stages
alter table public.stages enable row level security;

drop policy if exists "stages_all_own" on public.stages;
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
alter table public.modules enable row level security;

drop policy if exists "modules_all_own" on public.modules;
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

-- Lessons
alter table public.lessons enable row level security;

drop policy if exists "lessons_all_own" on public.lessons;
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
alter table public.resources enable row level security;

drop policy if exists "resources_all_own" on public.resources;
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

-- Notes
alter table public.module_notes enable row level security;

drop policy if exists "notes_all_own" on public.module_notes;
create policy "notes_all_own"
  on public.module_notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Quiz items
alter table public.quiz_items enable row level security;

drop policy if exists "quiz_items_all_own" on public.quiz_items;
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

-- Quiz attempts
alter table public.quiz_attempts enable row level security;

drop policy if exists "quiz_attempts_all_own" on public.quiz_attempts;
create policy "quiz_attempts_all_own"
  on public.quiz_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tutor threads
alter table public.tutor_threads enable row level security;

drop policy if exists "tutor_threads_all_own" on public.tutor_threads;
create policy "tutor_threads_all_own"
  on public.tutor_threads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tutor messages
alter table public.tutor_messages enable row level security;

drop policy if exists "tutor_messages_all_own" on public.tutor_messages;
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

-- Generation events
alter table public.generation_events enable row level security;

drop policy if exists "generation_events_select_own" on public.generation_events;
create policy "generation_events_select_own"
  on public.generation_events for select
  using (auth.uid() = user_id);

drop policy if exists "generation_events_insert_own" on public.generation_events;
create policy "generation_events_insert_own"
  on public.generation_events for insert
  with check (auth.uid() = user_id);

-- Seed AI Engineering pack metadata (lessons still AI-generated at runtime)
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
`;
