import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const NODE_ENV = process.env.NODE_ENV || 'development';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'neonest',
  waitForConnections: true,
  connectionLimit: NODE_ENV === 'production' ? 25 : 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * Execute a callback inside a MySQL transaction.
 * The callback receives a `conn` object with `.query(sql, params)` that
 * returns rows (same shape as the top-level `query()`).
 *
 * On success the transaction is committed and the callback's return value
 * is forwarded.  On error the transaction is rolled back and the error is
 * re-thrown.
 *
 * @template T
 * @param {(conn: { query: (sql: string, params?: any[]) => Promise<any[]> }) => Promise<T>} callback
 * @returns {Promise<T>}
 */
export async function withTransaction(callback) {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const wrappedConn = {
      async query(sql, params = []) {
        const [rows] = await conn.query(sql, params);
        return rows;
      }
    };
    const result = await callback(wrappedConn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export { pool };

const parseJson = (value, fallback = {}) => {
  try {
    return JSON.parse(value || '{}');
  } catch (err) {
    return fallback;
  }
};

const normalizeMeetingData = (data) => {
  if (!data) return null;
  return {
    provider: data.provider || 'jitsi',
    roomName: data.roomName || data.room_name || null,
    joinUrl: data.joinUrl || data.join_url || null,
    calendarEventId: data.calendarEventId || data.calendar_event_id || null,
    status: data.status || null,
    createdAt: data.createdAt || data.created_at || null,
    endedAt: data.endedAt || data.ended_at || null,
    cancelledAt: data.cancelledAt || data.cancelled_at || null
  };
};

export async function createOrUpdateOAuthToken(
  userId,
  provider,
  accessToken,
  refreshToken,
  expiresAt
) {
  const id = uuidv4();
  await query(
    `INSERT INTO user_oauth_tokens (id, user_id, provider, access_token, refresh_token, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       access_token = VALUES(access_token),
       refresh_token = COALESCE(VALUES(refresh_token), refresh_token),
       expires_at = VALUES(expires_at),
       updated_at = NOW()`,
    [
      id,
      userId,
      provider,
      accessToken,
      refreshToken || null,
      expiresAt ? new Date(expiresAt) : null
    ]
  );
}

export async function getOAuthToken(userId, provider) {
  const rows = await query(
    `SELECT id, user_id, provider, access_token, refresh_token, expires_at
     FROM user_oauth_tokens
     WHERE user_id = ? AND provider = ?
     LIMIT 1`,
    [userId, provider]
  );
  return rows.length ? rows[0] : null;
}

export async function deleteOAuthToken(userId, provider) {
  await query(
    `DELETE FROM user_oauth_tokens WHERE user_id = ? AND provider = ?`,
    [userId, provider]
  );
}

export async function getMeetingData(appointmentId) {
  const rows = await query(
    `SELECT id, user_id, data FROM app_entities WHERE id = ? AND type = 'appointment' LIMIT 1`,
    [appointmentId]
  );
  if (!rows.length) return null;
  const data = parseJson(rows[0].data, {});
  const rawMeeting = data.meetingData || data.meeting_data || null;
  return {
    appointment: { ...data, id: rows[0].id, userId: rows[0].user_id || data.userId },
    meetingData: normalizeMeetingData(rawMeeting)
  };
}

export async function saveMeetingData(appointmentId, meetingData) {
  return withTransaction(async (conn) => {
    const rows = await conn.query(
      `SELECT id, user_id, data FROM app_entities WHERE id = ? AND type = 'appointment' LIMIT 1 FOR UPDATE`,
      [appointmentId]
    );
    if (!rows.length) return null;

    const data = parseJson(rows[0].data, {});
    const appointment = { ...data, id: rows[0].id, userId: rows[0].user_id || data.userId };
    const payload = {
      ...appointment,
      meetingData,
      meetingUrl: meetingData?.joinUrl || appointment.meetingUrl || null,
      updatedAt: new Date().toISOString()
    };

    await conn.query(
      `UPDATE app_entities SET data = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(payload), appointmentId]
    );

    return payload;
  });
}

export async function updateMeetingStatus(appointmentId, status, extra = {}) {
  return withTransaction(async (conn) => {
    const rows = await conn.query(
      `SELECT id, user_id, data FROM app_entities WHERE id = ? AND type = 'appointment' LIMIT 1 FOR UPDATE`,
      [appointmentId]
    );
    if (!rows.length) return null;

    const data = parseJson(rows[0].data, {});
    const appointment = { ...data, id: rows[0].id, userId: rows[0].user_id || data.userId };
    const rawMeeting = data.meetingData || data.meeting_data || null;
    const meetingData = { ...(normalizeMeetingData(rawMeeting) || {}), status, ...extra };

    const payload = {
      ...appointment,
      meetingData,
      meetingUrl: meetingData?.joinUrl || appointment.meetingUrl || null,
      updatedAt: new Date().toISOString()
    };

    await conn.query(
      `UPDATE app_entities SET data = ?, updated_at = NOW() WHERE id = ?`,
      [JSON.stringify(payload), appointmentId]
    );

    return payload;
  });
}

export async function ensureChatHistoryTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS chat_history (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      message TEXT NOT NULL,
      response TEXT NOT NULL,
      model_used VARCHAR(50) NOT NULL,
      intent VARCHAR(50) NULL,
      locale VARCHAR(10) DEFAULT 'en',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chat_user_date (user_id, created_at),
      INDEX idx_chat_model (model_used),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
  );
}

export async function logChatHistory({
  id = uuidv4(),
  userId,
  message,
  response,
  modelUsed,
  intent,
  locale
}) {
  if (!userId || !message || !response || !modelUsed) return;
  await query(
    `INSERT INTO chat_history (id, user_id, message, response, model_used, intent, locale)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, message, response, modelUsed, intent || null, locale || 'en']
  );
}
