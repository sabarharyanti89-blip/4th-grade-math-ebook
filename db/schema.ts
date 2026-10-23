import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

export const students = pgTable('students', {
  id: serial().primaryKey(),
  token: text().notNull().unique(),
  name: text().notNull(),
  className: text('class_name').notNull(),
  absentNo: integer('absent_no').notNull(),
  videoPoints: integer('video_points').notNull().default(0),
  factorPoints: integer('factor_points').notNull().default(0),
  multiplePoints: integer('multiple_points').notNull().default(0),
  gamePoints: integer('game_points').notNull().default(0),
  gameDone: integer('game_done').notNull().default(0),
  finishedAt: timestamp('finished_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// One row per answered question; the unique index makes answers immutable.
export const answers = pgTable(
  'answers',
  {
    id: serial().primaryKey(),
    studentId: integer('student_id')
      .notNull()
      .references(() => students.id, { onDelete: 'cascade' }),
    questionNo: integer('question_no').notNull(),
    choice: integer().notNull(),
    points: integer().notNull(),
    answeredAt: timestamp('answered_at').notNull().defaultNow(),
  },
  (t) => [uniqueIndex('answers_student_question').on(t.studentId, t.questionNo)],
)
