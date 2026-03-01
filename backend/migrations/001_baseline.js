/**
 * Baseline migration — consolidates the six SQL bootstrap files that were
 * previously run ad-hoc at every server start into a single versioned
 * migration.
 *
 * Because every table uses `CREATE TABLE IF NOT EXISTS` and every view uses
 * `CREATE OR REPLACE VIEW`, this migration is safe to run on databases that
 * already have the schema in place — those statements will simply no-op.
 *
 * After this migration is recorded in `schema_migrations`, the server's
 * bootstrap function will skip the ad-hoc SQL loading.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '..');

const SQL_FILES = [
  'database-schema.sql',
  'add_role_column.sql',
  'create_system_tables.sql',
  'add_oauth_tokens.sql',
  'admin_tables_schema.sql',
  'create_dashboard_views.sql'
];

function stripSqlComments(sql) {
  const withoutBlock = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlock
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('#');
    })
    .join('\n');
}

function splitSqlStatements(sql) {
  return stripSqlComments(sql)
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean);
}

async function runSqlFile(queryFn, fileName) {
  const filePath = path.resolve(BACKEND_ROOT, fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  const statements = splitSqlStatements(raw);
  for (const statement of statements) {
    try {
      await queryFn(statement);
    } catch (err) {
      const msg = String(err?.message || err);
      // Ignore idempotent schema conflicts
      if (
        msg.includes('Duplicate key name') ||
        msg.includes('Duplicate column name') ||
        msg.includes('already exists')
      ) {
        continue;
      }
      throw err;
    }
  }
}

export default {
  async up(query) {
    for (const file of SQL_FILES) {
      await runSqlFile(query, file);
    }
  },

  async down(_query) {
    // Dropping the entire schema is too destructive for a down migration.
    // To start fresh, drop the database and re-create it.
    console.warn('001_baseline: down() is a no-op — drop & recreate the database to reset.');
  }
};
