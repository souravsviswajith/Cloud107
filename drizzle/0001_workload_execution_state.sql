CREATE TABLE "workloads" (
  "id" text PRIMARY KEY NOT NULL,
  "s1" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "execution_plans" (
  "id" text PRIMARY KEY NOT NULL,
  "workload_id" text NOT NULL,
  "s2" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_executions" (
  "id" text PRIMARY KEY NOT NULL,
  "plan_id" text NOT NULL,
  "s4" jsonb NOT NULL,
  "stdout" text,
  "stderr" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "execution_plans" ADD CONSTRAINT "execution_plans_workload_id_workloads_id_fk" FOREIGN KEY ("workload_id") REFERENCES "public"."workloads"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "process_executions" ADD CONSTRAINT "process_executions_plan_id_execution_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."execution_plans"("id") ON DELETE no action ON UPDATE no action;
