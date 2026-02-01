ALTER TABLE "workflows" ADD COLUMN "n8n_workflow_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "n8n_webhook_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workflows" ADD COLUMN "parameters" jsonb DEFAULT '{}'::jsonb;