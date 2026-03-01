/**
 * Lightweight migration runner for MySQL.
 *
 * Each migration is a JS file in `backend/migrations/` whose default export
 * is `{ up(query), down(query) }`.  Migrations are tracked in a
 * `schema_migrations` table and applied in filename order.
 *
 * Usage:
 *   node src/migrate.js              # apply pending migrations
 *   node src/migrate.js --status     # show migration status
 *   node src/migrate.js --down       # rollback last applied migration
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { pool, query, withTransaction } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '..', 'migrations');

const MIGRATIONS_TABLE = 'schema_migrations';

// ─── Helpers ─────────────────────────────────────────────────────────

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

// ─── Commands ────────────────────────────────────────────────────────

async function status() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  console.log('\nMigration status:');
  console.log('─'.repeat(60));
  if (!files.length) {
    console.log('  No migration files found in migrations/');
  }
  for (const file of files) {
    const mark = applied.has(file) ? '✓' : '✗';
    console.log(`  ${mark}  ${file}`);
  }
  console.log('─'.repeat(60));
  const pending = files.filter((f) => !applied.has(f));
  console.log(`  Applied: ${files.length - pending.length}  Pending: ${pending.length}\n`);
}

async function up() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();
  const pending = files.filter((f) => !applied.has(f));

  if (!pending.length) {
    console.log('All migrations are up to date.');
    return;
  }

  for (const file of pending) {
    const modulePath = path.join(MIGRATIONS_DIR, file);
    const mod = await import(`file://${modulePath.replace(/\\/g, '/')}`);
    const migration = mod.default || mod;

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file} does not export an up() function.`);
    }

    console.log(`  ↑ Applying ${file} …`);
    await withTransaction(async (conn) => {
      await migration.up(conn.query.bind(conn));
      await conn.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`,
        [file]
      );
    });
    console.log(`  ✓ ${file}`);
  }

  console.log(`\n${pending.length} migration(s) applied.`);
}

async function down() {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();
  const appliedFiles = files.filter((f) => applied.has(f));

  if (!appliedFiles.length) {
    console.log('No migrations to rollback.');
    return;
  }

  const last = appliedFiles[appliedFiles.length - 1];
  const modulePath = path.join(MIGRATIONS_DIR, last);
  const mod = await import(`file://${modulePath.replace(/\\/g, '/')}`);
  const migration = mod.default || mod;

  if (typeof migration.down !== 'function') {
    throw new Error(`Migration ${last} does not export a down() function.`);
  }

  console.log(`  ↓ Rolling back ${last} …`);
  await withTransaction(async (conn) => {
    await migration.down(conn.query.bind(conn));
    await conn.query(
      `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = ?`,
      [last]
    );
  });
  console.log(`  ✓ Rolled back ${last}`);
}

// ─── CLI entry point ─────────────────────────────────────────────────

const args = process.argv.slice(2);

try {
  if (args.includes('--status')) {
    await status();
  } else if (args.includes('--down')) {
    await down();
  } else {
    await up();
  }
} catch (err) {
  console.error('Migration error:', err.message || err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
