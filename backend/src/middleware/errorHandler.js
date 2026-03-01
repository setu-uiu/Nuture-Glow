/**
 * Global error-handling middleware.
 * Extracted from index.js for single-responsibility separation.
 */
import { sendError } from '../utils/response.js';

/**
 * Creates an error handler that is environment-aware.
 * In production, internal error messages are NOT sent to the client.
 *
 * @param {number} maxUploadBytes – used to format file-size error messages
 * @param {string} nodeEnv – 'development' | 'production'
 */
export function createErrorHandler(maxUploadBytes, nodeEnv = 'development') {
  return (err, req, res, _next) => {
    console.error('Error:', err);

    if (err?.code === 'LIMIT_FILE_SIZE') {
      const maxMb = Math.floor(maxUploadBytes / (1024 * 1024));
      return sendError(res, 413, `File too large. Maximum size is ${maxMb}MB.`);
    }

    const status = err.status || 500;

    // In production, hide internal error details from the client
    const message =
      nodeEnv === 'production' && status >= 500
        ? 'Internal server error'
        : err.message || 'Internal server error';

    sendError(res, status, message);
  };
}
