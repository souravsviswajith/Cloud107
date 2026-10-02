import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from 'drizzle-orm/pg-core';
import type { WorkloadRepresentation } from '../core/workload';
import type { ExecutionPlan } from '../core/execution-plan';
import { WorkspaceState } from '../types';
import type { CapabilityInvocationStatus } from '../core/invocation';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Cloud107 Identity / WebAuthn UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(), // using uuid for workspace id
  name: text('name').notNull(),
  state: text('state').notNull().$type<WorkspaceState>(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
}));

export const workspacesRelations = relations(workspaces, ({ one }) => ({
  user: one(users, {
    fields: [workspaces.userId],
    references: [users.id],
  }),
}));

export const applications = pgTable('applications', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  icon: text('icon').notNull(),
  color: text('color'),
  enabled: boolean('enabled').default(true).notNull(),
  installed: boolean('installed').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationSessions = pgTable('application_sessions', {
  id: text('id').primaryKey(),
  applicationId: text('application_id')
    .notNull()
    .references(() => applications.id),
  workspaceId: text('workspace_id')
    .notNull()
    .references(() => workspaces.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationsRelations = relations(applications, ({ many }) => ({
  sessions: many(applicationSessions),
}));

export const workloads = pgTable('workloads', {
  id: text('id').primaryKey(),
  s1: jsonb('s1').$type<WorkloadRepresentation>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const executionPlans = pgTable('execution_plans', {
  id: text('id').primaryKey(),
  workloadId: text('workload_id')
    .notNull()
    .references(() => workloads.id),
  s2: jsonb('s2').$type<ExecutionPlan>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const processExecutions = pgTable('process_executions', {
  id: text('id').primaryKey(),
  planId: text('plan_id')
    .notNull()
    .references(() => executionPlans.id),
  s4: jsonb('s4').$type<{
    pid: number;
    exitCode: number | null;
    signal: string | null;
    stdout: string;
    stderr: string;
    duration: number;
  }>().notNull(),
  stdout: text('stdout'),
  stderr: text('stderr'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const invocations = pgTable('invocations', {
  id: text('id').primaryKey(),
  capability: text('capability').notNull(),
  status: text('status').notNull().$type<CapabilityInvocationStatus>(),
  s1Id: text('s1_id').references(() => workloads.id),
  result: jsonb('result'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
});

export const workloadsRelations = relations(workloads, ({ many }) => ({
  executionPlans: many(executionPlans),
  invocations: many(invocations),
}));

export const executionPlansRelations = relations(executionPlans, ({ one, many }) => ({
  workload: one(workloads, {
    fields: [executionPlans.workloadId],
    references: [workloads.id],
  }),
  processExecutions: many(processExecutions),
}));

export const processExecutionsRelations = relations(processExecutions, ({ one }) => ({
  plan: one(executionPlans, {
    fields: [processExecutions.planId],
    references: [executionPlans.id],
  }),
}));

export const invocationsRelations = relations(invocations, ({ one }) => ({
  workload: one(workloads, {
    fields: [invocations.s1Id],
    references: [workloads.id],
  }),
}));

export const applicationSessionsRelations = relations(applicationSessions, ({ one }) => ({
  application: one(applications, {
    fields: [applicationSessions.applicationId],
    references: [applications.id],
  }),
  workspace: one(workspaces, {
    fields: [applicationSessions.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [applicationSessions.userId],
    references: [users.id],
  }),
}));
