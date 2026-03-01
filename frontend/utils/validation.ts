/**
 * Validation utilities for authentication and forms
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
}

/**
 * Email validation with comprehensive checks
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  email = email.trim().toLowerCase();

  // Basic format check
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  // Check for common typos
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const domain = email.split('@')[1];
  const typoPatterns = [
    { wrong: 'gmail.cm', correct: 'gmail.com' },
    { wrong: 'gmial.com', correct: 'gmail.com' },
    { wrong: 'gmai.com', correct: 'gmail.com' },
    { wrong: 'yahooo.com', correct: 'yahoo.com' },
  ];

  for (const typo of typoPatterns) {
    if (domain === typo.wrong) {
      return { isValid: false, error: `Did you mean ${email.split('@')[0]}@${typo.correct}?` };
    }
  }

  // Check for suspicious patterns
  if (email.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots' };
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, error: 'Email cannot start or end with a dot' };
  }

  return { isValid: true };
};

/**
 * Bangladesh phone number validation
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Bangladesh phone patterns
  // +8801XXXXXXXXX (13 digits with country code)
  // 8801XXXXXXXXX (12 digits)
  // 01XXXXXXXXX (11 digits)
  const patterns = [
    /^\+8801[3-9]\d{8}$/, // +880 format
    /^8801[3-9]\d{8}$/,   // 880 format
    /^01[3-9]\d{8}$/,     // Local format
  ];

  const isValid = patterns.some(pattern => pattern.test(cleaned));

  if (!isValid) {
    return { 
      isValid: false, 
      error: 'Invalid Bangladesh phone number (e.g., +8801712345678 or 01712345678)' 
    };
  }

  return { isValid: true };
};

/**
 * Password strength checker with detailed feedback
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;
  const feedback: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: '#EF4444',
      feedback: ['Password is required'],
    };
  }

  // Length check
  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  
  // Character variety checks
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

  // Penalty for common patterns
  const commonPatterns = [
    '123456', 'password', 'qwerty', 'abc123', '111111', 
    '123123', 'password123', 'admin', '12345678'
  ];
  
  if (commonPatterns.some(pattern => password.toLowerCase().includes(pattern))) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common patterns');
  }

  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  if (score === 0) {
    label = 'Very Weak';
    color = '#EF4444'; // red
  } else if (score <= 1) {
    label = 'Weak';
    color = '#F59E0B'; // orange
  } else if (score === 2) {
    label = 'Fair';
    color = '#EAB308'; // yellow
  } else if (score === 3) {
    label = 'Strong';
    color = '#10B981'; // green
  } else {
    label = 'Very Strong';
    color = '#059669'; // dark green
  }

  return { score, label, color, feedback };
};

/**
 * Validate password with requirements
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }

  const strength = checkPasswordStrength(password);
  
  if (strength.score < 2) {
    return { 
      isValid: false, 
      error: `Password is too weak. ${strength.feedback.join(', ')}` 
    };
  }

  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name is too long (max 50 characters)' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and common Bengali/international characters
  const nameRegex = /^[a-zA-Z\s\u0980-\u09FF\u0600-\u06FF\u4E00-\u9FFF\-'\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name contains invalid characters' };
  }

  // Check for excessive spaces or special characters
  if (/\s{2,}/.test(trimmed)) {
    return { isValid: false, error: 'Name cannot contain multiple consecutive spaces' };
  }

  return { isValid: true };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Check if passwords match
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true };
};

/**
 * Rate limit checker (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  canAttempt(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeUntilReset = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, Math.ceil(timeUntilReset / 1000)); // seconds
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};
