import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Source of truth for Pathforge Postgres schema.
 * Never hand-write SQL migrations — edit this file, then:
 *   pnpm db:generate
 *   pnpm db:migrate
 */

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // matches auth.users.id
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const packTemplates = pgTable("pack_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  intakeDefaults: jsonb("intake_defaults")
    .notNull()
    .default(sql`'{}'::jsonb`),
  diagnosticBank: jsonb("diagnostic_bank")
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const paths = pgTable(
  "paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    source: text("source").notNull(), // pack | prompt
    packSlug: text("pack_slug"),
    topic: text("topic").notNull(),
    goal: text("goal").notNull(),
    hoursPerWeek: numeric("hours_per_week").notNull().default("5"),
    deadline: date("deadline"),
    title: text("title"),
    summary: text("summary"),
    estHours: numeric("est_hours"),
    status: text("status").notNull().default("draft"),
    domainAlert: text("domain_alert"),
    /** Cached placement questions so Strict Mode / refresh does not re-bill the Gateway */
    diagnosticQuestions: jsonb("diagnostic_questions"),
    diagnosticResult: jsonb("diagnostic_result"),
    l0Payload: jsonb("l0_payload"),
    isActive: boolean("is_active").notNull().default(true),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("paths_user_id_idx").on(t.userId),
    index("paths_user_active_idx").on(t.userId, t.isActive),
  ],
);

export const stages = pgTable(
  "stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pathId: uuid("path_id")
      .notNull()
      .references(() => paths.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    estHours: numeric("est_hours"),
    l1Status: text("l1_status").notNull().default("pending"),
    l1Payload: jsonb("l1_payload"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("stages_path_id_idx").on(t.pathId),
    unique("stages_path_position_uidx").on(t.pathId, t.position),
  ],
);

export const modules = pgTable(
  "modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => stages.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    blurb: text("blurb").notNull().default(""),
    estMinutes: integer("est_minutes"),
    l2Status: text("l2_status").notNull().default("pending"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("modules_stage_id_idx").on(t.stageId),
    unique("modules_stage_position_uidx").on(t.stageId, t.position),
  ],
);

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id")
    .notNull()
    .unique()
    .references(() => modules.id, { onDelete: "cascade" }),
  /** Primary teach surface (MDX with fixed skeleton). Empty on legacy rows. */
  mdx: text("mdx").notNull().default(""),
  /** @deprecated Legacy short cards; empty for new L2 gens */
  cards: jsonb("cards").notNull().default(sql`'[]'::jsonb`),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const resources = pgTable(
  "resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    kind: text("kind").notNull().default("article"),
    provider: text("provider"),
    snippet: text("snippet"),
    verified: boolean("verified").notNull().default(false),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("resources_module_id_idx").on(t.moduleId)],
);

export const moduleNotes = pgTable(
  "module_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    body: text("body").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique("module_notes_module_user_uidx").on(t.moduleId, t.userId)],
);

export const quizItems = pgTable(
  "quiz_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
    prompt: text("prompt").notNull(),
    choices: jsonb("choices").notNull().default(sql`'[]'::jsonb`),
    correctIndex: integer("correct_index").notNull().default(0),
    explanation: text("explanation").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("quiz_items_module_id_idx").on(t.moduleId)],
);

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizItemId: uuid("quiz_item_id")
    .notNull()
    .references(() => quizItems.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull(),
  choiceIndex: integer("choice_index").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tutorThreads = pgTable(
  "tutor_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("tutor_threads_module_user_uidx").on(t.moduleId, t.userId),
  ],
);

export const tutorMessages = pgTable(
  "tutor_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => tutorThreads.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("tutor_messages_thread_id_idx").on(t.threadId)],
);

export const generationEvents = pgTable(
  "generation_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    level: text("level").notNull(),
    entityId: uuid("entity_id"),
    ok: boolean("ok").notNull().default(true),
    errorMessage: text("error_message"),
    meta: jsonb("meta").notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("generation_events_user_created_idx").on(t.userId, t.createdAt)],
);

export const pathsRelations = relations(paths, ({ many }) => ({
  stages: many(stages),
}));

export const stagesRelations = relations(stages, ({ one, many }) => ({
  path: one(paths, { fields: [stages.pathId], references: [paths.id] }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  stage: one(stages, { fields: [modules.stageId], references: [stages.id] }),
  lesson: one(lessons),
  resources: many(resources),
  quizItems: many(quizItems),
}));
