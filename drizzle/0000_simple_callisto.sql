CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'approved', 'deployed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('viewer', 'developer', 'approver', 'admin');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"parent_id" varchar(255),
	"org_id" varchar(255) NOT NULL,
	"workflow_id" varchar(255),
	"action" varchar(50) NOT NULL,
	"actor_id" varchar(255) NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"plan_status" varchar(50) DEFAULT 'free' NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secrets" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"key_name" varchar(255) NOT NULL,
	"encrypted_value" text NOT NULL,
	"iv" text NOT NULL,
	"tag" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"org_id" varchar(255),
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"org_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "workflow_status" DEFAULT 'draft' NOT NULL,
	"specification" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secrets" ADD CONSTRAINT "secrets_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflows" ADD CONSTRAINT "workflows_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_workflow_idx" ON "audit_logs" USING btree ("workflow_id");--> statement-breakpoint
CREATE INDEX "audit_parent_idx" ON "audit_logs" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "audit_org_idx" ON "audit_logs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "audit_org_workflow_timestamp_idx" ON "audit_logs" USING btree ("org_id","workflow_id","timestamp");--> statement-breakpoint
CREATE INDEX "org_plan_idx" ON "organizations" USING btree ("plan_status");--> statement-breakpoint
CREATE INDEX "org_stripe_cust_idx" ON "organizations" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "secrets_org_idx" ON "secrets" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "secrets_org_keyname_idx" ON "secrets" USING btree ("org_id","key_name");--> statement-breakpoint
CREATE INDEX "wf_org_idx" ON "workflows" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "wf_org_status_idx" ON "workflows" USING btree ("org_id","status");