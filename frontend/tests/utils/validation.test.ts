/**
 * Tests for utils/validation.ts
 * Covers: validateEmail, validatePhone, checkPasswordStrength,
 *         validatePassword, validateName, sanitizeInput,
 *         validatePasswordMatch, RateLimiter, formatTimeRemaining
 */
import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  checkPasswordStrength,
  validatePassword,
  validateName,
  sanitizeInput,
  validatePasswordMatch,
  RateLimiter,
  formatTimeRemaining,
} from '../../utils/validation';

/* ================================================================
   validateEmail
   ================================================================ */
describe('validateEmail', () => {
  it('returns error for empty string', () => {
    expect(validateEmail('')).toEqual({ isValid: false, error: 'Email is required' });
  });

  it('accepts a valid email', () => {
    expect(validateEmail('alice@gmail.com')).toEqual({ isValid: true });
  });

  it('accepts email with plus addressing', () => {
    expect(validateEmail('alice+tag@gmail.com')).toEqual({ isValid: true });
  });

  it('rejects email without @', () => {
    const result = validateEmail('alicegmail.com');
    expect(result.isValid).toBe(false);
  });

  it('rejects email without domain extension', () => {
    const result = validateEmail('alice@gmail');
    expect(result.isValid).toBe(false);
  });

  it('suggests correction for common typo gmail.cm', () => {
    const result = validateEmail('alice@gmail.cm');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('gmail.com');
  });

  it('suggests correction for gmial.com typo', () => {
    const result = validateEmail('alice@gmial.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('gmail.com');
  });

  it('rejects email with consecutive dots', () => {
    const result = validateEmail('alice..bob@gmail.com');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('consecutive dots');
  });

  it('rejects email starting with a dot', () => {
    const result = validateEmail('.alice@gmail.com');
    expect(result.isValid).toBe(false);
  });

  it('trims and lowercases input', () => {
    expect(validateEmail('  Alice@Gmail.COM  ')).toEqual({ isValid: true });
  });
});

/* ================================================================
   validatePhone
   ================================================================ */
describe('validatePhone', () => {
  it('returns error for empty string', () => {
    expect(validatePhone('')).toEqual({ isValid: false, error: 'Phone number is required' });
  });

  it('accepts +880 format', () => {
    expect(validatePhone('+8801712345678')).toEqual({ isValid: true });
  });

  it('accepts 880 format (no plus)', () => {
    expect(validatePhone('8801712345678')).toEqual({ isValid: true });
  });

  it('accepts local 01X format', () => {
    expect(validatePhone('01712345678')).toEqual({ isValid: true });
  });

  it('strips spaces and dashes before validation', () => {
    expect(validatePhone('017-1234-5678')).toEqual({ isValid: true });
  });

  it('rejects invalid prefix (012)', () => {
    const result = validatePhone('01212345678');
    expect(result.isValid).toBe(false);
  });

  it('rejects too-short numbers', () => {
    const result = validatePhone('0171234');
    expect(result.isValid).toBe(false);
  });

  it('rejects non-Bangladesh numbers', () => {
    const result = validatePhone('+12125551234');
    expect(result.isValid).toBe(false);
  });
});

/* ================================================================
   checkPasswordStrength
   ================================================================ */
describe('checkPasswordStrength', () => {
  it('returns Very Weak for empty password', () => {
    const result = checkPasswordStrength('');
    expect(result.score).toBe(0);
    expect(result.label).toBe('Very Weak');
  });

  it('returns low score for short password', () => {
    const result = checkPasswordStrength('abc');
    expect(result.score).toBeLessThanOrEqual(1);
  });

  it('scores higher for mixed-case + numbers + symbols + length', () => {
    const result = checkPasswordStrength('MyP@ssw0rd!!XYZ');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(['Strong', 'Very Strong']).toContain(result.label);
  });

  it('penalizes common patterns like "password"', () => {
    const result = checkPasswordStrength('password123!');
    expect(result.feedback).toContain('Avoid common patterns');
  });

  it('penalizes repeated characters', () => {
    const result = checkPasswordStrength('aaabbbccc1!A');
    expect(result.feedback).toContain('Avoid repeating characters');
  });
});

/* ================================================================
   validatePassword
   ================================================================ */
describe('validatePassword', () => {
  it('returns error for empty password', () => {
    expect(validatePassword('')).toEqual({ isValid: false, error: 'Password is required' });
  });

  it('returns error for passwords shorter than 8 chars', () => {
    const result = validatePassword('Ab1!xx');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 8 characters');
  });

  it('returns error for passwords longer than 128 chars', () => {
    const result = validatePassword('A'.repeat(129));
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('too long');
  });

  it('rejects weak password with only lowercase', () => {
    const result = validatePassword('abcdefgh');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('too weak');
  });

  it('accepts a strong password', () => {
    expect(validatePassword('MyStr0ng!Pass')).toEqual({ isValid: true });
  });
});

/* ================================================================
   validateName
   ================================================================ */
describe('validateName', () => {
  it('returns error for empty name', () => {
    expect(validateName('')).toEqual({ isValid: false, error: 'Name is required' });
  });

  it('rejects single-character names', () => {
    const result = validateName('A');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('at least 2 characters');
  });

  it('rejects names over 50 characters', () => {
    const result = validateName('A'.repeat(51));
    expect(result.isValid).toBe(false);
  });

  it('accepts standard name', () => {
    expect(validateName('Alice Johnson')).toEqual({ isValid: true });
  });

  it('accepts Bengali characters', () => {
    expect(validateName('আয়েশা')).toEqual({ isValid: true });
  });

  it('accepts hyphenated names', () => {
    expect(validateName("Mary-Jane O'Brien")).toEqual({ isValid: true });
  });

  it('rejects names with consecutive spaces', () => {
    const result = validateName('Alice  Johnson');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('consecutive spaces');
  });

  it('rejects names with numbers', () => {
    const result = validateName('Alice123');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('invalid characters');
  });
});

/* ================================================================
   sanitizeInput
   ================================================================ */
describe('sanitizeInput', () => {
  it('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('strips HTML angle brackets', () => {
    expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
  });

  it('strips javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).toBe('alert(1)');
  });

  it('strips inline event handlers', () => {
    expect(sanitizeInput('onerror=alert(1)')).toBe('alert(1)');
  });

  it('leaves clean text untouched', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});

/* ================================================================
   validatePasswordMatch
   ================================================================ */
describe('validatePasswordMatch', () => {
  it('passes when passwords match', () => {
    expect(validatePasswordMatch('abc123', 'abc123')).toEqual({ isValid: true });
  });

  it('fails when passwords differ', () => {
    expect(validatePasswordMatch('abc123', 'xyz789')).toEqual({
      isValid: false,
      error: 'Passwords do not match',
    });
  });
});

/* ================================================================
   RateLimiter
   ================================================================ */
describe('RateLimiter', () => {
  it('allows attempts within limit', () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.canAttempt('login')).toBe(true);
    expect(limiter.canAttempt('login')).toBe(true);
    expect(limiter.canAttempt('login')).toBe(true);
  });

  it('blocks attempts exceeding limit', () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.canAttempt('login');
    limiter.canAttempt('login');
    expect(limiter.canAttempt('login')).toBe(false);
  });

  it('tracks keys independently', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.canAttempt('user-a');
    expect(limiter.canAttempt('user-a')).toBe(false);
    expect(limiter.canAttempt('user-b')).toBe(true);
  });

  it('reports remaining time when rate-limited', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.canAttempt('login');
    const remaining = limiter.getRemainingTime('login');
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(60);
  });

  it('returns 0 remaining time when not rate-limited', () => {
    const limiter = new RateLimiter(5, 60_000);
    expect(limiter.getRemainingTime('login')).toBe(0);
  });

  it('resets attempts for a key', () => {
    const limiter = new RateLimiter(1, 60_000);
    limiter.canAttempt('login');
    expect(limiter.canAttempt('login')).toBe(false);
    limiter.reset('login');
    expect(limiter.canAttempt('login')).toBe(true);
  });
});

/* ================================================================
   formatTimeRemaining
   ================================================================ */
describe('formatTimeRemaining', () => {
  it('formats seconds correctly', () => {
    expect(formatTimeRemaining(30)).toBe('30 seconds');
  });

  it('uses singular for 1 second', () => {
    expect(formatTimeRemaining(1)).toBe('1 second');
  });

  it('converts to minutes for >= 60s', () => {
    expect(formatTimeRemaining(60)).toBe('1 minute');
  });

  it('rounds up to next minute', () => {
    expect(formatTimeRemaining(90)).toBe('2 minutes');
  });
});
