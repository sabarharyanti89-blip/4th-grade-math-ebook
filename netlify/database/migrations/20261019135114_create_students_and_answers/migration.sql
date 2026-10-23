CREATE TABLE "answers" (
	"id" serial PRIMARY KEY,
	"student_id" integer NOT NULL,
	"question_no" integer NOT NULL,
	"choice" integer NOT NULL,
	"points" integer NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY,
	"token" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"class_name" text NOT NULL,
	"absent_no" integer NOT NULL,
	"video_points" integer DEFAULT 0 NOT NULL,
	"factor_points" integer DEFAULT 0 NOT NULL,
	"multiple_points" integer DEFAULT 0 NOT NULL,
	"game_points" integer DEFAULT 0 NOT NULL,
	"game_done" integer DEFAULT 0 NOT NULL,
	"finished_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "answers_student_question" ON "answers" ("student_id","question_no");--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_student_id_students_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;