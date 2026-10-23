import 'server-only'
import postgres from 'postgres'

const SCHEMA = `
CREATE TABLE IF NOT EXISTS students (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  phone         TEXT,
  belt          TEXT NOT NULL DEFAULT 'white',
  stripes       SMALLINT NOT NULL DEFAULT 0,
  training_type TEXT NOT NULL DEFAULT 'both' CHECK (training_type IN ('gi', 'nogi', 'both')),
  start_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes         TEXT,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS attendance (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  class_type  TEXT NOT NULL CHECK (class_type IN ('gi', 'nogi')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, date, class_type)
);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance (date);

CREATE TABLE IF NOT EXISTS promotions (
  id          SERIAL PRIMARY KEY,
  student_id  INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  belt        TEXT NOT NULL,
  stripes     SMALLINT NOT NULL DEFAULT 0,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS promotions_student_idx ON promotions (student_id, date);
`

export function databaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
}

function createClient() {
  const url = databaseUrl()
  if (!url) throw new Error('DATABASE_URL is not set. See README.md → "Deploy to Vercel".')
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url)
  return postgres(url, {
    ssl: local ? false : 'require',
    // Serverless functions: keep few connections, and stay compatible with poolers (PgBouncer).
    max: 3,
    idle_timeout: 20,
    prepare: false,
    // Return DATE columns as 'YYYY-MM-DD' strings instead of JS Dates.
    types: {
      date: {
        to: 1082,
        from: [1082],
        serialize: (x: string) => x,
        parse: (x: string) => x,
      },
    },
  })
}

type Sql = ReturnType<typeof createClient>

const g = globalThis as unknown as { __sql?: Sql; __schema?: Promise<void> }

async function migrate(sql: Sql) {
  await sql.begin(async (tx) => {
    // Several serverless instances may start at once; only one creates tables.
    await tx`SELECT pg_advisory_xact_lock(727274)`
    await tx.unsafe(SCHEMA)
  })
}

/** Returns a ready-to-use SQL client. Tables are created automatically on first use. */
export async function db(): Promise<Sql> {
  if (!g.__sql) g.__sql = createClient()
  const sql = g.__sql
  if (!g.__schema) {
    g.__schema = migrate(sql).catch((err) => {
      g.__schema = undefined
      throw err
    })
  }
  await g.__schema
  return sql
}
