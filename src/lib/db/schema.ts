import { pgTable, uuid, varchar, timestamp, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const statusEnum = pgEnum('workflow_status', ['draft', 'approved', 'deployed', 'paused'])
export const userRoleEnum = pgEnum('user_role', ['viewer', 'developer', 'approver', 'admin'])

export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  planStatus: varchar('plan_status', { length: 50 }).default('free').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').default('viewer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft').notNull(),
  specification: jsonb('specification').notNull(),
  version: integer('version').default(1).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 50 }).notNull(),
  actorId: uuid('actor_id')
    .notNull()
    .references(() => users.id),
  previousStatus: statusEnum('previous_status'),
  newStatus: statusEnum('new_status'),
  payload: jsonb('payload'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
})

export const secrets = pgTable('secrets', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id)
    .notNull(),
  keyName: varchar('key_name', { length: 255 }).notNull(),
  encryptedValue: varchar('encrypted_value').notNull(),
  iv: varchar('iv', { length: 255 }).notNull(),
  tag: varchar('tag', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const organizationRelations = relations(organizations, ({ many }) => ({
  workflows: many(workflows),
}))

export const workflowRelations = relations(workflows, ({ one }) => ({
  organization: one(organizations, {
    fields: [workflows.orgId],
    references: [organizations.id],
  }),
}))
