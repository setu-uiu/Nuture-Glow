/**
 * Shared validation utilities.
 * Extracted from index.js to eliminate duplicate helper definitions
 * across index.js, appRoutes.js, and adminRoutes.js.
 */

// ─── Email ──────────────────────────────────────────────────────────

export const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

export const validateEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: 'Invalid email format' };
  }
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { ok: false, error: 'Invalid email format' };
  }
  return { ok: true };
};

// ─── Phone ──────────────────────────────────────────────────────────

export const normalizePhone = (value) => String(value || '').trim();

export const validateBangladeshPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const patterns = [
    /^\+8801[3-9]\d{8}$/,
    /^8801[3-9]\d{8}$/,
    /^01[3-9]\d{8}$/
  ];
  const ok = patterns.some((pattern) => pattern.test(cleaned));
  return ok
    ? { ok: true }
    : { ok: false, error: 'Invalid Bangladesh phone number (e.g., +8801712345678 or 01712345678)' };
};

// ─── Name ───────────────────────────────────────────────────────────

export const validateName = (name) => {
  const trimmed = String(name || '').trim();
  if (!trimmed) {
    return { ok: false, error: 'Name is required' };
  }
  if (trimmed.length < 2) {
    return { ok: false, error: 'Name must be at least 2 characters' };
  }
  if (trimmed.length > 50) {
    return { ok: false, error: 'Name is too long (max 50 characters)' };
  }
  const nameRegex = /^[a-zA-Z\s\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF\-'\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { ok: false, error: 'Name contains invalid characters' };
  }
  if (/\s{2,}/.test(trimmed)) {
    return { ok: false, error: 'Name cannot contain multiple consecutive spaces' };
  }
  return { ok: true, value: trimmed };
};

// ─── Password ───────────────────────────────────────────────────────

export const checkPasswordStrength = (password) => {
  let score = 0;
  const feedback = [];

  if (!password || typeof password !== 'string') {
    return { score: 0, feedback: ['Password is required'] };
  }

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score++;
  } else {
    feedback.push('Mix uppercase and lowercase letters');
  }

  if (/\d/.test(password)) {
    score++;
  } else {
    feedback.push('Include at least one number');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score++;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  const commonPatterns = [
    '123456', 'password', 'qwerty', 'abc123', '111111',
    '123123', 'password123', 'admin', '12345678'
  ];
  if (commonPatterns.some((pattern) => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }

  return { score, feedback };
};

export const validatePassword = (password) => {
  if (!password) {
    return { ok: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters' };
  }
  if (password.length > 128) {
    return { ok: false, error: 'Password is too long (max 128 characters)' };
  }
  const strength = checkPasswordStrength(password);
  if (strength.score < 2) {
    return { ok: false, error: `Password is too weak. ${strength.feedback.join(', ')}` };
  }
  return { ok: true };
};
