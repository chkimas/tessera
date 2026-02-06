import {
  pgTable,
  varchar,
  timestamp,
  text,
  jsonb,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export const statusEnum = pgEnum('workflow_status', ['draft', 'approved', 'deployed', 'paused'])
export const userRoleEnum = pgEnum('user_role', ['viewer', 'developer', 'approver', 'admin'])

export const organizations = pgTable(
  'organizations',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    planStatus: varchar('plan_status', { length: 50 }).default('free').notNull(),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
    stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  t => [index('org_plan_idx').on(t.planStatus), index('org_stripe_cust_idx').on(t.stripeCustomerId)]
)

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  orgId: varchar('org_id', { length: 255 }).references(() => organizations.id),
  email: varchar('email', { length: 255 }).notNull().unique(),
  role: userRoleEnum('role').default('viewer').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const workflows = pgTable(
  'workflows',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orgId: varchar('org_id', { length: 255 })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    status: statusEnum('status').default('draft').notNull(),
    specification: jsonb('specification').notNull(),
    version: integer('version').default(1).notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    n8nWorkflowId: text('n8n_workflow_id'),
    n8nWebhookUrl: text('n8n_webhook_url'),
    parameters: jsonb('parameters').default({}),
  },
  t => [index('wf_org_idx').on(t.orgId), index('wf_org_status_idx').on(t.orgId, t.status)]
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    parentId: varchar('parent_id', { length: 255 }),
    orgId: varchar('org_id', { length: 255 })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    workflowId: varchar('workflow_id', { length: 255 }).references(() => workflows.id, {
      onDelete: 'cascade',
    }),
    action: varchar('action', { length: 50 }).notNull(),
    actorId: varchar('actor_id', { length: 255 }).notNull(),
    payload: jsonb('payload').default({}).notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  t => [
    index('audit_workflow_idx').on(t.workflowId),
    index('audit_parent_idx').on(t.parentId),
    index('audit_org_idx').on(t.orgId),
    index('audit_org_workflow_timestamp_idx').on(t.orgId, t.workflowId, t.timestamp),
  ]
)

export const secrets = pgTable(
  'secrets',
  {
    id: varchar('id', { length: 255 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orgId: varchar('org_id', { length: 255 })
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    keyName: varchar('key_name', { length: 255 }).notNull(),
    encryptedValue: text('encrypted_value').notNull(),
    iv: text('iv').notNull(),
    tag: text('tag').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  t => [
    index('secrets_org_idx').on(t.orgId),
    index('secrets_org_keyname_idx').on(t.orgId, t.keyName),
  ]
)

export const organizationRelations = relations(organizations, ({ many }) => ({
  workflows: many(workflows),
}))

export const workflowRelations = relations(workflows, ({ one }) => ({
  organization: one(organizations, {
    fields: [workflows.orgId],
    references: [organizations.id],
  }),
}))
