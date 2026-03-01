/**
 * Standardized API response helpers.
 *
 * Every endpoint should use these instead of hand-crafting res.json() shapes.
 * This guarantees a consistent envelope for the frontend to consume.
 */

/**
 * Send a success response.
 *
 * @param {import('express').Response} res
 * @param {*} data   – payload (object, array, primitive …)
 * @param {number} [status=200]
 * @param {{ page?: number, pageSize?: number, total?: number, totalPages?: number }} [meta]
 */
export function sendSuccess(res, data, status = 200, meta) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

/**
 * Send a created response (201).
 *
 * @param {import('express').Response} res
 * @param {*} data
 */
export function sendCreated(res, data) {
  return sendSuccess(res, data, 201);
}

/**
 * Send a standardized error response.
 *
 * @param {import('express').Response} res
 * @param {number} status   – HTTP status code (400, 401, 403, 404, 409, 500 …)
 * @param {string} message  – human-readable error message
 * @param {Record<string, any>} [extra] – optional additional fields (reason, details …)
 */
export function sendError(res, status, message, extra) {
  const body = { success: false, error: message };
  if (extra) Object.assign(body, extra);
  return res.status(status).json(body);
}

/**
 * Parse pagination query parameters with safe defaults.
 *
 * @param {import('express').Request} req
 * @param {{ maxPageSize?: number, defaultPageSize?: number }} [opts]
 * @returns {{ page: number, pageSize: number, offset: number }}
 */
export function parsePagination(req, opts = {}) {
  const { maxPageSize = 100, defaultPageSize = 20 } = opts;

  let page = Math.max(1, Math.floor(Number(req.query.page)) || 1);
  let pageSize = Math.floor(Number(req.query.pageSize || req.query.limit)) || defaultPageSize;
  pageSize = Math.min(Math.max(1, pageSize), maxPageSize);

  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

/**
 * Build pagination metadata from a total count and current page state.
 *
 * @param {number} total
 * @param {number} page
 * @param {number} pageSize
 * @returns {{ page: number, pageSize: number, total: number, totalPages: number }}
 */
export function paginationMeta(total, page, pageSize) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}
