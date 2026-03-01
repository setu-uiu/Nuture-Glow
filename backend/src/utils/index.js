/**
 * Barrel export for all shared utilities.
 * Import from here instead of reaching into individual files.
 *
 * Example:  import { parseJson, validateName } from './utils/index.js';
 */
export {
  normalizeEmail,
  validateEmailFormat,
  normalizePhone,
  validateBangladeshPhone,
  validateName,
  checkPasswordStrength,
  validatePassword
} from './validation.js';

export {
  parseJson,
  toTrimmedString,
  toOptionalString,
  isPlainObject,
  normalizeEnumValue,
  parseBooleanParam,
  toNonNegativeNumber,
  toPositiveNumber,
  isValidId,
  isValidDateValue,
  isPastDateValue
} from './helpers.js';

export { createNotification } from './notifications.js';

export {
  sendSuccess,
  sendCreated,
  sendError,
  parsePagination,
  paginationMeta
} from './response.js';
