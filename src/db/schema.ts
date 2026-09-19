import { relations } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { WorkspaceState } from '../types';

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
  userId: integer('user_id').notNull().references(() => users.id),
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
  applicationId: text('application_id').notNull().references(() => applications.id),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const applicationsRelations = relations(applications, ({ many }) => ({
  sessions: many(applicationSessions),
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
