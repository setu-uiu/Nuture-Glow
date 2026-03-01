/**
 * Input sanitization middleware.
 * Extracted from index.js for single-responsibility separation.
 */

/**
 * Strips `<` and `>` from all string fields in req.body to mitigate basic XSS.
 * NOTE: This is a naive sanitizer. Consider using a proper library like
 * `dompurify` or `sanitize-html` for richer content fields.
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    const sanitize = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/[<>]/g, '')
            .trim()
            .substring(0, 5000);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
}
