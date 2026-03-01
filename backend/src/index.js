import express from 'express';
import { z } from 'zod';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { query, ensureChatHistoryTable, pool } from './db.js';
import { seedDatabase } from './seed.js';
import { attachSignaling } from './signaling.js';
import { createAppRouter } from './appRoutes.js';
import { createAdminRouter } from './adminRoutes.js';
import { ensureAppTables, seedAppData, getUserMeta, listEntities, setUserMeta } from './appStore.js';
import { normalizeRoleValue, CANONICAL_ROLES, getRoleFilterOptions } from './roles.js';
import {
  avatarUpload,
  buildPublicFileUrl,
  maxUploadBytes,
  removeUploadFileByUrl,
  uploadRoot,
  verificationDocUpload
} from './uploads.js';
import { verifyEmailConfig } from './emailService.js';
import 'dotenv/config';

// ─── Refactored modules ────────────────────────────────────────────
import { createAuthMiddleware } from './middleware/auth.js';
import { sanitizeInput } from './middleware/sanitize.js';
import { createErrorHandler } from './middleware/errorHandler.js';
import { createAuthRouter } from './routes/auth.js';
import { createProfileRouter } from './routes/profile.js';
import { createHealthRouter } from './routes/health.js';

const NODE_ENV = process.env.NODE_ENV || 'development';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.resolve(__dirname, '..');
const DEV_JWT_SECRET_PATH = path.join(BACKEND_ROOT, '.dev_jwt_secret');
const loadDevJwtSecret = () => {
  try {
    const secret = fsSync.readFileSync(DEV_JWT_SECRET_PATH, 'utf8').trim();
    if (secret.length >= 32) {
      return secret;
    }
  } catch (err) {
    // Ignore missing file
  }

  const generated = crypto.randomBytes(32).toString('hex');
  try {
    fsSync.writeFileSync(DEV_JWT_SECRET_PATH, generated, { encoding: 'utf8', mode: 0o600 });
  } catch (err) {
    console.warn('Failed to persist dev JWT secret:', err.message || err);
  }
  return generated;
};

const JWT_SECRET = (() => {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    return process.env.JWT_SECRET;
  }
  if (NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a 32+ char value in production.');
  }
  console.warn('JWT_SECRET is missing or too short. Using a persisted dev secret.');
  return loadDevJwtSecret();
})();

const ADMIN_INVITE_CODE = process.env.ADMIN_INVITE_CODE || 'NURTURE_ADMIN_2026';

// Validation helpers now imported from utils — no more duplication
// (see src/utils/validation.js, src/utils/helpers.js)

// Auth middleware from extracted module
const { requireAuth, checkSuspensionStatus, requireRole, requireConsentForPatient } =
  createAuthMiddleware(JWT_SECRET);

const app = express();

if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const corsOriginRaw = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '*';
const corsOrigins = corsOriginRaw
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const allowAllOrigins = corsOrigins.includes('*');

if (NODE_ENV === 'production' && allowAllOrigins) {
  throw new Error('CORS_ORIGIN must be an explicit origin list in production.');
}
if (!allowAllOrigins && corsOrigins.length === 0) {
  throw new Error('CORS_ORIGIN resolved to an empty list.');
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(cors({ origin: allowAllOrigins ? true : corsOrigins }));
app.use(express.json({ limit: '15mb' }));
app.use(morgan('dev'));
app.use('/uploads', express.static(uploadRoot));

const getTokenUserId = (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload?.sub || null;
  } catch (err) {
    return null;
  }
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' }
});

const adminExportLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getTokenUserId(req) || ipKeyGenerator(req),
  skip: (req) => !req.path.includes('admin') || !req.path.includes('export'),
  message: { error: 'Too many requests. Please try again later.' }
});

app.use(apiLimiter);
app.use(adminExportLimiter);

// Auth-specific rate limiter (stricter for login/register)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in a minute.' }
});
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// Input sanitization (extracted to middleware/sanitize.js)
app.use(sanitizeInput);

const DB_NAME = process.env.DB_NAME || 'neonest';
if (NODE_ENV === 'production') {
  const envSchema = z.object({
    DB_HOST: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    JWT_SECRET: z.string().min(32),
    CORS_ORIGIN: z.string().optional(),
    FRONTEND_URL: z.string().optional()
  }).refine((data) => Boolean(data.CORS_ORIGIN || data.FRONTEND_URL), {
    message: 'CORS_ORIGIN or FRONTEND_URL must be set in production'
  });

  const envCheck = envSchema.safeParse(process.env);
  if (!envCheck.success) {
    throw new Error(`Invalid production environment configuration: ${envCheck.error.message}`);
  }

  if (process.env.DB_USER === 'root' || process.env.DB_PASSWORD === 'root') {
    console.warn('Production DB credentials appear to be defaults. Set secure DB_USER/DB_PASSWORD.');
  }
}

const TABLES = [
  'users',
  'user_profiles',
  'roles',
  'user_roles',
  'user_oauth_tokens',
  'emergency_contacts',
  'mothers',
  'pregnancies',
  'children',
  'health_records',
  'health_record_files',
  'allergies',
  'pregnancy_checkins',
  'child_growth_logs',
  'vaccine_schedules',
  'vaccine_schedule_items',
  'vaccination_events',
  'reminders',
  'reminder_deliveries',
  'mental_questions',
  'mental_assessments',
  'mental_answers',
  'referrals',
  'doctor_specialties',
  'doctors',
  'doctor_availability_slots',
  'consultations',
  'video_sessions',
  'consultation_messages',
  'hospitals',
  'icu_status_updates',
  'ambulances',
  'emergency_requests',
  'emergency_status_events',
  'gov_resources',
  'certificates',
  'vendors',
  'product_categories',
  'products',
  'orders',
  'order_items',
  'payments',
  'files',
  'file_links',
  'chat_history',
  'notifications',
  'audit_logs',
  'addresses',
  'ngos',
  'doctor_reviews',
  'product_reviews'
];

const tableCache = new Map();

const SQL_BOOTSTRAP_FILES = [
  { file: 'database-schema.sql', required: true },
  { file: 'add_role_column.sql', required: false },
  { file: 'create_system_tables.sql', required: true },
  { file: 'add_oauth_tokens.sql', required: false },
  { file: 'admin_tables_schema.sql', required: true },
  { file: 'create_dashboard_views.sql', required: false }
];

const stripSqlComments = (sql) => {
  const withoutBlock = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  return withoutBlock
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('#');
    })
    .join('\n');
};

const splitSqlStatements = (sql) =>
  stripSqlComments(sql)
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean);

const LOG_DUPLICATE_SCHEMA_WARNINGS =
  process.env.LOG_DUPLICATE_SCHEMA_WARNINGS === 'true';

const resolveSqlPath = async (fileName) => {
  const candidates = [
    path.resolve(process.cwd(), fileName),
    path.resolve(process.cwd(), 'backend', fileName),
    path.resolve(BACKEND_ROOT, fileName)
  ];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch (err) {
      // try next
    }
  }

  throw new Error(`SQL file not found: ${fileName}`);
};

async function runSqlFile(fileName) {
  const filePath = await resolveSqlPath(fileName);
  const raw = await fs.readFile(filePath, 'utf-8');
  const statements = splitSqlStatements(raw);
  for (const statement of statements) {
    try {
      await query(statement);
    } catch (err) {
      const msg = String(err?.message || err);
      if (
        msg.includes('Duplicate key name') ||
        msg.includes('Duplicate column name') ||
        msg.includes('already exists')
      ) {
        if (LOG_DUPLICATE_SCHEMA_WARNINGS) {
          console.warn('Ignored duplicate schema error:', msg);
        }
        continue;
      }
      throw err;
    }
  }
}

const STRICT_BOOTSTRAP = process.env.STRICT_BOOTSTRAP === 'true' || NODE_ENV === 'production';

async function ensureAdminSchema() {
  const failures = [];

  for (const entry of SQL_BOOTSTRAP_FILES) {
    const fileName = typeof entry === 'string' ? entry : entry.file;
    const required = typeof entry === 'string' ? false : Boolean(entry.required);
    try {
      await runSqlFile(fileName);
    } catch (err) {
      const message = err?.message || String(err);
      if (STRICT_BOOTSTRAP || required) {
        failures.push({ fileName, message });
      } else {
        console.warn(`Schema bootstrap skipped for ${fileName}:`, message);
      }
    }
  }

  if (failures.length) {
    const details = failures.map((f) => `${f.fileName}: ${f.message}`).join('; ');
    throw new Error(`Schema bootstrap failed: ${details}`);
  }
}

async function assertCoreTables() {
  const requiredTables = ['users', 'user_profiles', 'roles', 'user_roles'];
  const placeholders = requiredTables.map(() => '?').join(', ');
  const rows = await query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (${placeholders})`,
    [DB_NAME, ...requiredTables]
  );
  const existing = new Set(rows.map((row) => row.TABLE_NAME || Object.values(row)[0]));
  const missing = requiredTables.filter((table) => !existing.has(table));
  if (missing.length) {
    throw new Error(
      `Missing core tables: ${missing.join(', ')}. Ensure database-schema.sql was applied.`
    );
  }
}

async function getTableMeta(table) {
  if (tableCache.has(table)) {
    return tableCache.get(table);
  }

  const columns = await query(
    `SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
     ORDER BY ORDINAL_POSITION`,
    [DB_NAME, table]
  );

  const pkColumns = await query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND CONSTRAINT_NAME = 'PRIMARY'
     ORDER BY ORDINAL_POSITION`,
    [DB_NAME, table]
  );

  const meta = {
    columns: columns.map(col => ({
      name: col.COLUMN_NAME,
      nullable: col.IS_NULLABLE === 'YES',
      hasDefault: col.COLUMN_DEFAULT !== null,
      autoIncrement: String(col.EXTRA || '').includes('auto_increment')
    })),
    pk: pkColumns.map(col => col.COLUMN_NAME)
  };

  tableCache.set(table, meta);
  return meta;
}

// requireAuth, checkSuspensionStatus, requireRole, requireConsentForPatient
// are now created via createAuthMiddleware(JWT_SECRET) at the top of this file.

async function getUserProfile(userId) {
  const rows = await query(
    `SELECT u.id, u.phone, u.email, u.status, u.role, p.full_name, p.preferred_language
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  if (!rows.length) return null;
  const row = rows[0];
  const meta = await getUserMeta(userId, ['avatar']);
  const verificationDocs = await listEntities({ type: 'verification_doc', userId });
  const verificationStatus = (() => {
    if (!verificationDocs.length) return 'Not Submitted';
    if (verificationDocs.some((doc) => doc.status === 'VERIFIED')) return 'Verified';
    if (verificationDocs.some((doc) => doc.status === 'PENDING')) return 'Pending';
    if (verificationDocs.some((doc) => doc.status === 'REJECTED')) return 'Rejected';
    return 'Not Submitted';
  })();
  return {
    id: row.id,
    phone: row.phone,
    email: row.email,
    name: row.full_name || 'User',
    healthId: `NG-${row.id.slice(0, 8).toUpperCase()}`,
    avatar: meta.avatar || `https://picsum.photos/seed/${row.id}/100/100`,
    verified: verificationStatus,
    preferredLanguage: row.preferred_language || 'en',
    role: normalizeRoleValue(row.role || 'mother')
  };
}

// ─── Mount extracted routers ────────────────────────────────────────
app.use(createHealthRouter());

app.use(
  createAuthRouter({
    JWT_SECRET,
    ADMIN_INVITE_CODE,
    requireAuth,
    checkSuspensionStatus,
    getUserProfile
  })
);

app.use(
  createProfileRouter({
    requireAuth,
    avatarUpload,
    buildPublicFileUrl,
    removeUploadFileByUrl,
    getUserProfile
  })
);

const adminRouter = createAdminRouter({ requireAuth, requireRole });
const mapLegacyAdminPath = (prefix) => (req, res, next) => {
  const originalUrl = req.url;
  req.url = `${prefix}${originalUrl}`;
  adminRouter(req, res, (err) => {
    req.url = originalUrl;
    next(err);
  });
};

app.use('/api/admin', adminRouter);
app.use('/api/system-admin', mapLegacyAdminPath('/system'));
app.use('/api/ops-admin', mapLegacyAdminPath('/operations'));
app.use(
  '/api',
  createAppRouter({
    requireAuth,
    requireRole,
    requireConsentForPatient,
    verificationDocUpload,
    buildPublicFileUrl,
    removeUploadFileByUrl
  })
);

app.get('/admin/tables', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const metas = await Promise.all(TABLES.map(async (table) => {
      const meta = await getTableMeta(table);
      return { table, columns: meta.columns, pk: meta.pk };
    }));
    res.json({ tables: metas });
  } catch (err) {
    next(err);
  }
});

app.get('/admin/:table', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const table = req.params.table;
    if (!TABLES.includes(table)) {
      return res.status(404).json({ error: 'Unknown table' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const rows = await query(`SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`, [limit, offset]);
    res.json({ rows });
  } catch (err) {
    next(err);
  }
});

app.get('/admin/:table/row', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const table = req.params.table;
    if (!TABLES.includes(table)) {
      return res.status(404).json({ error: 'Unknown table' });
    }

    const meta = await getTableMeta(table);
    if (!meta.pk.length) {
      return res.status(400).json({ error: 'Table has no primary key' });
    }

    const whereClauses = [];
    const params = [];
    for (const pk of meta.pk) {
      const value = req.query[pk];
      if (!value) {
        return res.status(400).json({ error: `Missing primary key ${pk}` });
      }
      whereClauses.push(`\`${pk}\` = ?`);
      params.push(value);
    }

    const rows = await query(`SELECT * FROM \`${table}\` WHERE ${whereClauses.join(' AND ')} LIMIT 1`, params);
    if (!rows.length) {
      return res.status(404).json({ error: 'Row not found' });
    }
    res.json({ row: rows[0] });
  } catch (err) {
    next(err);
  }
});

app.post('/admin/:table', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const table = req.params.table;
    if (!TABLES.includes(table)) {
      return res.status(404).json({ error: 'Unknown table' });
    }

    const meta = await getTableMeta(table);
    const body = req.body || {};

    const columns = meta.columns.map(col => col.name);
    const autoCols = new Set(meta.columns.filter(col => col.autoIncrement).map(col => col.name));

    if (columns.includes('id') && !body.id && !autoCols.has('id')) {
      body.id = uuidv4();
    }

    const keys = Object.keys(body).filter(key => columns.includes(key) && !autoCols.has(key));
    if (!keys.length) {
      return res.status(400).json({ error: 'No valid columns supplied' });
    }

    const placeholders = keys.map(() => '?').join(', ');
    const colsSql = keys.map(key => `\`${key}\``).join(', ');
    const values = keys.map(key => body[key]);

    await query(`INSERT INTO \`${table}\` (${colsSql}) VALUES (${placeholders})`, values);

    res.status(201).json({ id: body.id || null });
  } catch (err) {
    next(err);
  }
});

app.put('/admin/:table/row', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const table = req.params.table;
    if (!TABLES.includes(table)) {
      return res.status(404).json({ error: 'Unknown table' });
    }

    const meta = await getTableMeta(table);
    if (!meta.pk.length) {
      return res.status(400).json({ error: 'Table has no primary key' });
    }

    const whereClauses = [];
    const params = [];
    for (const pk of meta.pk) {
      const value = req.query[pk];
      if (!value) {
        return res.status(400).json({ error: `Missing primary key ${pk}` });
      }
      whereClauses.push(`\`${pk}\` = ?`);
      params.push(value);
    }

    const columns = meta.columns.map(col => col.name);
    const autoCols = new Set(meta.columns.filter(col => col.autoIncrement).map(col => col.name));

    const updates = Object.keys(req.body || {})
      .filter(key => columns.includes(key) && !autoCols.has(key) && !meta.pk.includes(key));

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid columns supplied' });
    }

    const setSql = updates.map(key => `\`${key}\` = ?`).join(', ');
    const values = updates.map(key => req.body[key]);

    await query(
      `UPDATE \`${table}\` SET ${setSql} WHERE ${whereClauses.join(' AND ')}`,
      [...values, ...params]
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/admin/:table/row', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    const table = req.params.table;
    if (!TABLES.includes(table)) {
      return res.status(404).json({ error: 'Unknown table' });
    }

    const meta = await getTableMeta(table);
    if (!meta.pk.length) {
      return res.status(400).json({ error: 'Table has no primary key' });
    }

    const whereClauses = [];
    const params = [];
    for (const pk of meta.pk) {
      const value = req.query[pk];
      if (!value) {
        return res.status(400).json({ error: `Missing primary key ${pk}` });
      }
      whereClauses.push(`\`${pk}\` = ?`);
      params.push(value);
    }

    await query(`DELETE FROM \`${table}\` WHERE ${whereClauses.join(' AND ')}`, params);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/admin/seed', requireAuth, requireRole('system_admin'), checkSuspensionStatus, async (req, res, next) => {
  try {
    await seedDatabase();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handler (extracted to middleware/errorHandler.js)
// In production, hides internal error messages from clients.
app.use(createErrorHandler(maxUploadBytes, NODE_ENV));

const port = Number(process.env.PORT || 4000);

async function bootstrap() {
  // ── Run migration system (replaces ad-hoc SQL bootstrap on first run) ──
  const { runMigrationsIfPending } = await import('./migrateRunner.js');
  const migrated = await runMigrationsIfPending();

  // Fall back to legacy SQL bootstrap if no migrations have been applied yet
  // (e.g. very first run before the baseline migration exists)
  if (!migrated) {
    await ensureAdminSchema();
  }

  await assertCoreTables();
  await ensureAppTables();
  await ensureChatHistoryTable();
  await seedAppData();
  
  // Verify email configuration
  console.log('Verifying email configuration...');
  const emailConfigValid = await verifyEmailConfig();
  if (emailConfigValid) {
    console.log('✓ Email service is ready');
  } else {
    console.warn('⚠ Email service not configured. Password reset emails will not be sent.');
    console.warn('  Configure EMAIL_USER and EMAIL_PASSWORD in .env to enable email functionality.');
  }
  
  const server = app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });

  // Attach WebSocket signaling server for WebRTC video calls
  attachSignaling(server);

  // ── Graceful shutdown ─────────────────────────────────────────────
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully…`);
    server.close(async () => {
      try {
        await pool.end();
        console.log('Database pool closed.');
      } catch (err) {
        console.error('Error closing database pool:', err.message);
      }
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long (10 s)
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Export middleware functions for use in routes
export { requireAuth, requireRole, requireConsentForPatient, checkSuspensionStatus };

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
