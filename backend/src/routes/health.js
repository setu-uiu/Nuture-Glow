/**
 * Health check and diagnostic routes.
 * Extracted from index.js.
 */
import express from 'express';
import { query } from '../db.js';
import { sendSuccess } from '../utils/response.js';

export function createHealthRouter() {
  const router = express.Router();

  router.get('/health', (req, res) => {
    sendSuccess(res, { status: 'ok' });
  });

  router.get('/db/ping', async (req, res, next) => {
    try {
      const rows = await query('SELECT 1 AS ok');
      sendSuccess(res, { ok: rows[0]?.ok === 1 });
    } catch (err) {
      next(err);
    }
  });

  router.get('/db/tables', async (req, res, next) => {
    try {
      const rows = await query('SHOW TABLES');
      const tables = rows.map((row) => Object.values(row)[0]);
      sendSuccess(res, { tables });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
