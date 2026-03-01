/**
 * Shared parsing and data-manipulation helpers.
 * Extracted from index.js / appRoutes.js / adminRoutes.js
 * to eliminate duplicate utility definitions.
 */

export const parseJson = (value, fallback = {}) => {
  try {
    return JSON.parse(value || '{}');
  } catch (err) {
    return fallback;
  }
};

export const toTrimmedString = (value, maxLen = 5000) => {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) : str;
};

export const toOptionalString = (value, maxLen = 5000) => {
  const str = toTrimmedString(value, maxLen);
  return str || null;
};

export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const normalizeEnumValue = (value, allowed) => {
  if (value === null || value === undefined) return null;
  const str = String(value).trim();
  if (allowed.has(str)) return str;
  const lower = str.toLowerCase();
  for (const item of allowed) {
    if (String(item).toLowerCase() === lower) {
      return item;
    }
  }
  return null;
};

export const parseBooleanParam = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

export const toNonNegativeNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : null;
};

export const toPositiveNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : null;
};

export const isValidId = (value) => /^[a-zA-Z0-9_-]{2,100}$/.test(String(value || ''));

export const isValidDateValue = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime());
};

export const isPastDateValue = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.getTime() < Date.now();
};
