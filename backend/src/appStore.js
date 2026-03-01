import { v4 as uuidv4 } from 'uuid';
import { query } from './db.js';
import { SEED_DOCTORS, SEED_HOSPITALS, SEED_MEDICINES, SEED_DONORS, SEED_VACCINE_SCHEDULE } from './appSeeds.js';

const nowIso = () => new Date().toISOString();

const parseRow = (row) => {
  let data = {};
  try {
    data = JSON.parse(row.data || '{}');
  } catch (err) {
    data = {};
  }
  return { id: row.id, ...data };
};

async function fetchEntityRow({ id, type, userId }) {
  const clauses = ['id = ?', 'type = ?'];
  const params = [id, type];
  if (userId !== undefined) {
    clauses.push('user_id = ?');
    params.push(userId);
  }
  const rows = await query(
    `SELECT id, user_id, subtype, data FROM app_entities WHERE ${clauses.join(' AND ')} LIMIT 1`,
    params
  );
  return rows[0] || null;
}

export async function ensureAppTables() {
  await query(
    `CREATE TABLE IF NOT EXISTS app_entities (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id VARCHAR(36) NULL,
      type VARCHAR(50) NOT NULL,
      subtype VARCHAR(100) NULL,
      data LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      INDEX idx_type (type),
      INDEX idx_user_type (user_id, type),
      INDEX idx_user_type_sub (user_id, type, subtype)
    )`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS app_user_meta (
      user_id VARCHAR(36) NOT NULL,
      meta_key VARCHAR(50) NOT NULL,
      meta_value VARCHAR(255) NOT NULL,
      updated_at DATETIME NOT NULL,
      PRIMARY KEY (user_id, meta_key)
    )`
  );

  await query(
    `CREATE TABLE IF NOT EXISTS app_catalog (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      data LONGTEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL,
      INDEX idx_catalog_type (type)
    )`
  );
}

export async function listEntities({ type, userId, subtype, order = 'DESC' }) {
  const clauses = ['type = ?'];
  const params = [type];

  if (userId !== undefined) {
    if (userId === null) {
      clauses.push('user_id IS NULL');
    } else {
      clauses.push('user_id = ?');
      params.push(userId);
    }
  }

  if (subtype !== undefined) {
    if (subtype === null) {
      clauses.push('subtype IS NULL');
    } else {
      clauses.push('subtype = ?');
      params.push(subtype);
    }
  }

  const sortOrder = order === 'ASC' ? 'ASC' : 'DESC';
  const rows = await query(
    `SELECT id, data FROM app_entities WHERE ${clauses.join(' AND ')} ORDER BY created_at ${sortOrder}`,
    params
  );
  return rows.map(parseRow);
}

export async function getEntity({ id, type, userId }) {
  const row = await fetchEntityRow({ id, type, userId });
  return row ? parseRow(row) : null;
}

export async function createEntity({ type, userId, subtype, data }) {
  const id = uuidv4();
  const now = new Date();
  const payload = {
    ...data,
    id,
    createdAt: data?.createdAt || now.toISOString(),
    updatedAt: now.toISOString()
  };

  await query(
    `INSERT INTO app_entities (id, user_id, type, subtype, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId || null, type, subtype || null, JSON.stringify(payload), now, now]
  );

  return payload;
}

export async function updateEntity({ id, type, userId, data, subtype }) {
  const row = await fetchEntityRow({ id, type, userId });
  if (!row) return null;

  const existing = parseRow(row);
  const now = new Date();
  const payload = {
    ...existing,
    ...data,
    id,
    updatedAt: now.toISOString()
  };

  await query(
    `UPDATE app_entities SET data = ?, updated_at = ?, subtype = ? WHERE id = ?`,
    [JSON.stringify(payload), now, subtype ?? row.subtype ?? null, id]
  );

  return payload;
}

export async function deleteEntity({ id, type, userId }) {
  const clauses = ['id = ?', 'type = ?'];
  const params = [id, type];
  if (userId !== undefined) {
    clauses.push('user_id = ?');
    params.push(userId);
  }
  const result = await query(
    `DELETE FROM app_entities WHERE ${clauses.join(' AND ')}`,
    params
  );
  return result.affectedRows > 0;
}

export async function upsertBySubtype({ type, userId, subtype, data }) {
  const rows = await query(
    `SELECT id, data, subtype FROM app_entities WHERE type = ? AND user_id = ? AND subtype = ? LIMIT 1`,
    [type, userId, subtype]
  );

  if (rows.length) {
    const existing = parseRow(rows[0]);
    return updateEntity({
      id: rows[0].id,
      type,
      userId,
      subtype,
      data: { ...existing, ...data }
    });
  }

  return createEntity({ type, userId, subtype, data });
}

export async function getBySubtype({ type, userId, subtype }) {
  const rows = await query(
    `SELECT id, data FROM app_entities WHERE type = ? AND user_id = ? AND subtype = ? LIMIT 1`,
    [type, userId, subtype]
  );
  return rows.length ? parseRow(rows[0]) : null;
}

export async function deleteEntitiesByTypes(userId, types) {
  if (!types.length) return 0;
  const placeholders = types.map(() => '?').join(', ');
  const result = await query(
    `DELETE FROM app_entities WHERE user_id = ? AND type IN (${placeholders})`,
    [userId, ...types]
  );
  return result.affectedRows || 0;
}

export async function getUserMeta(userId, keys) {
  if (!keys.length) return {};
  const placeholders = keys.map(() => '?').join(', ');
  const rows = await query(
    `SELECT meta_key, meta_value FROM app_user_meta WHERE user_id = ? AND meta_key IN (${placeholders})`,
    [userId, ...keys]
  );
  return rows.reduce((acc, row) => {
    acc[row.meta_key] = row.meta_value;
    return acc;
  }, {});
}

export async function setUserMeta(userId, values) {
  const entries = Object.entries(values || {});
  if (!entries.length) return;
  const now = new Date();
  for (const [key, value] of entries) {
    await query(
      `INSERT INTO app_user_meta (user_id, meta_key, meta_value, updated_at)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE meta_value = VALUES(meta_value), updated_at = VALUES(updated_at)`,
      [userId, key, String(value), now]
    );
  }
}

export async function listCatalog(type) {
  const rows = await query(
    `SELECT id, data FROM app_catalog WHERE type = ? ORDER BY created_at ASC`,
    [type]
  );
  return rows.map(parseRow);
}

async function seedCatalogType(type, items) {
  const rows = await query('SELECT id, data FROM app_catalog WHERE type = ?', [type]);
  if (rows.length > 0) {
    if (type !== 'medicine') return;

    const demoIds = new Set(['m1', 'm2', 'm3']);
    const existingIds = rows.map((row) => row.id);
    const isDemoOnly = existingIds.length > 0 && existingIds.every((id) => demoIds.has(id));

    const parsedRows = rows.map((row) => {
      try {
        return parseRow(row);
      } catch (err) {
        return { id: row.id };
      }
    });

    const images = parsedRows.map((row) => row?.image || '').filter(Boolean);
    const picsumCount = images.filter((src) => String(src).includes('picsum.photos/seed/med-')).length;
    const isPicsumCatalog = images.length > 0 && picsumCount / images.length >= 0.8;

    const seedMap = new Map(items.map((item) => [item.id, item]));
    const existingMap = new Map(parsedRows.map((item) => [item.id, item]));

    const signature = (item) =>
      [
        String(item?.name || ''),
        String(item?.category || ''),
        String(item?.image || ''),
        Number(item?.price || 0)
      ].join('|');

    const missingSeed = items.some((item) => !existingMap.has(item.id));
    const extraSeed = parsedRows.some((item) => !seedMap.has(item.id));
    const mismatchedSeed = items.some((item) => {
      const existing = existingMap.get(item.id);
      if (!existing) return true;
      return signature(existing) !== signature(item);
    });

    if (!isDemoOnly && !isPicsumCatalog && !missingSeed && !extraSeed && !mismatchedSeed) return;
    await query('DELETE FROM app_catalog WHERE type = ?', [type]);
  }

  const now = new Date();
  for (const item of items) {
    const id = item.id || uuidv4();
    const payload = { ...item, id };
    await query(
      `INSERT INTO app_catalog (id, type, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, type, JSON.stringify(payload), now, now]
    );
  }
}

async function seedDonors() {
  const rows = await query("SELECT COUNT(*) AS count FROM app_entities WHERE type = 'donor'");
  if (rows[0]?.count > 0) return;

  for (const donor of SEED_DONORS) {
    await createEntity({
      type: 'donor',
      userId: null,
      data: donor
    });
  }
}

export async function seedAppData() {
  await seedCatalogType('doctor', SEED_DOCTORS);
  await seedCatalogType('hospital', SEED_HOSPITALS);
  await seedCatalogType('medicine', SEED_MEDICINES);
  await seedCatalogType('vaccine_schedule', SEED_VACCINE_SCHEDULE);
  await seedDonors();
}
