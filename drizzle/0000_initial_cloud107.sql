CREATE TABLE "users" (
  "id" serial PRIMARY KEY NOT NULL,
  "uid" text NOT NULL,
  "email" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "state" text NOT NULL,
  "user_id" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "category" text NOT NULL,
  "icon" text NOT NULL,
  "color" text,
  "enabled" boolean DEFAULT true NOT NULL,
  "installed" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "application_id" text NOT NULL,
  "workspace_id" text NOT NULL,
  "user_id" integer NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "application_sessions" ADD CONSTRAINT "application_sessions_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "application_sessions" ADD CONSTRAINT "application_sessions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "application_sessions" ADD CONSTRAINT "application_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
