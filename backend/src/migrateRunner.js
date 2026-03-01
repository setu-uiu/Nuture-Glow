/**
 * Inline migration runner used by bootstrap().
 * It applies any pending migrations found in `backend/migrations/`
 * and returns true if at least one migration was applied (or all are already
 * up-to-date), false if the migrations infrastructure doesn't exist yet.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { pool, query, withTransaction } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');
const MIGRATIONS_TABLE = 'schema_migrations';

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      name        VARCHAR(255) NOT NULL UNIQUE,
      applied_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations() {
  const rows = await query(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id ASC`
  );
  return new Set(rows.map((r) => r.name));
}

async function getMigrationFiles() {
  try {
    const entries = await fs.readdir(MIGRATIONS_DIR);
    return entries
      .filter((f) => f.endsWith('.js'))
      .sort();
  } catch {
    return [];
  }
}

/**
 * Apply any pending migrations.
 * @returns {Promise<boolean>} true if the migration system is active
 *          (even if zero new migrations needed to run), false if no
 *          migration files exist at all.
 */
export async function runMigrationsIfPending() {
  const files = await getMigrationFiles();
  if (!files.length) return false;

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const pending = files.filter((f) => !applied.has(f));

  if (!pending.length) {
    console.log('Migrations: all up-to-date.');
    return true;
  }

  for (const file of pending) {
    const modulePath = path.join(MIGRATIONS_DIR, file);
    const mod = await import(`file://${modulePath.replace(/\\/g, '/')}`);
    const migration = mod.default || mod;

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file} does not export an up() function.`);
    }

    console.log(`  ↑ Applying migration ${file} …`);
    await withTransaction(async (conn) => {
      await migration.up(conn.query.bind(conn));
      await conn.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`,
        [file]
      );
    });
    console.log(`  ✓ ${file}`);
  }

  console.log(`Migrations: ${pending.length} applied.`);
  return true;
}
