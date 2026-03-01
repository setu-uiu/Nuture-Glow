/**
 * Authentication routes: register, login, forgot/reset password, suspension appeal, /auth/me.
 * Extracted from the monolithic index.js.
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db.js';
import { normalizeRoleValue, CANONICAL_ROLES, getRoleFilterOptions } from '../roles.js';
import {
  normalizeEmail,
  validateEmailFormat,
  normalizePhone,
  validateBangladeshPhone,
  validateName,
  validatePassword
} from '../utils/index.js';
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  sendSuspensionAppealEmail
} from '../emailService.js';

const ADMIN_ROLES = new Set(['medical_admin', 'ops_admin', 'system_admin']);

/**
 * @param {{ JWT_SECRET: string, ADMIN_INVITE_CODE: string, requireAuth: Function, checkSuspensionStatus: Function, getUserProfile: Function }} deps
 */
export function createAuthRouter({ JWT_SECRET, ADMIN_INVITE_CODE, requireAuth, checkSuspensionStatus, getUserProfile }) {
  const router = express.Router();

  // ─── Register ────────────────────────────────────────────────────
  router.post('/auth/register', async (req, res, next) => {
    try {
      const { name, email, phone, password, preferred_language, role, inviteCode } = req.body || {};

      const nameValidation = validateName(name);
      if (!nameValidation.ok) {
        return res.status(400).json({ error: nameValidation.error });
      }

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const normalizedEmail = normalizeEmail(email);
      const emailValidation = validateEmailFormat(normalizedEmail);
      if (!emailValidation.ok) {
        return res.status(400).json({ error: emailValidation.error });
      }

      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }

      const normalizedPhone = normalizePhone(phone);
      const phoneValidation = validateBangladeshPhone(normalizedPhone);
      if (!phoneValidation.ok) {
        return res.status(400).json({ error: phoneValidation.error });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.ok) {
        return res.status(400).json({ error: passwordValidation.error });
      }

      const normalizedRole = normalizeRoleValue(role) || 'mother';
      if (!CANONICAL_ROLES.has(normalizedRole)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      if (ADMIN_ROLES.has(normalizedRole)) {
        if (!inviteCode || inviteCode !== ADMIN_INVITE_CODE) {
          return res.status(403).json({ error: 'Invalid or missing admin invitation code' });
        }
      }

      const existing = await query(
        'SELECT id FROM users WHERE email = ? OR phone = ? LIMIT 1',
        [normalizedEmail, normalizedPhone]
      );
      if (existing.length) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const userId = uuidv4();
      const passwordHash = await bcrypt.hash(password, 12); // increased from 10 to 12 per OWASP recommendation
      const healthId = `NG-${userId.slice(0, 8).toUpperCase()}`;

      await query(
        'INSERT INTO users (id, phone, email, password_hash, auth_provider, status, role, health_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, normalizedPhone, normalizedEmail, passwordHash, 'local', 'active', normalizedRole, healthId]
      );

      await query(
        'INSERT INTO user_profiles (user_id, full_name, preferred_language) VALUES (?, ?, ?)',
        [userId, nameValidation.value, preferred_language || 'en']
      );

      const roleRows = await query('SELECT id FROM roles WHERE role_name = ? LIMIT 1', ['USER']);
      if (roleRows.length) {
        await query('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [userId, roleRows[0].id]);
      }

      const user = await getUserProfile(userId);
      const token = jwt.sign({ sub: userId, role: user?.role }, JWT_SECRET, { expiresIn: '7d' });

      if (normalizedEmail) {
        sendWelcomeEmail(normalizedEmail, nameValidation.value).catch((err) =>
          console.error('Failed to send welcome email:', err.message)
        );
      }

      res.status(201).json({ token, user });
    } catch (err) {
      next(err);
    }
  });

  // ─── Login ───────────────────────────────────────────────────────
  router.post('/auth/login', async (req, res, next) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier || !password) {
        return res.status(400).json({ error: 'identifier and password are required' });
      }

      const rows = await query(
        'SELECT id, password_hash, status FROM users WHERE email = ? OR phone = ? LIMIT 1',
        [identifier, identifier]
      );

      if (!rows.length) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const userRow = rows[0];
      const ok = await bcrypt.compare(password, userRow.password_hash || '');
      if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (userRow.status !== 'active') {
        let suspensionDetails = null;
        if (userRow.status === 'suspended') {
          try {
            const suspensions = await query(
              `SELECT id, data, created_at FROM app_entities WHERE type = 'user_suspension' AND user_id = ? ORDER BY created_at DESC LIMIT 1`,
              [userRow.id]
            );
            if (suspensions.length > 0) {
              const data = JSON.parse(suspensions[0].data || '{}');
              suspensionDetails = {
                id: data.id || suspensions[0].id,
                reason: data.reason || null,
                suspendedAt: data.suspendedAt || suspensions[0].created_at
              };
            }
          } catch (e) {
            // ignore
          }
        }

        const appealToken =
          userRow.status === 'suspended'
            ? jwt.sign({ sub: userRow.id, purpose: 'suspension_appeal' }, JWT_SECRET, { expiresIn: '15m' })
            : null;

        return res.status(403).json({
          error: userRow.status === 'suspended' ? 'Account suspended' : 'User is blocked',
          reason: userRow.status,
          suspension: suspensionDetails,
          appeal: userRow.status === 'suspended'
            ? { enabled: true, token: appealToken, expiresInMinutes: 15, endpoint: '/auth/suspension-appeal' }
            : { enabled: false }
        });
      }

      const user = await getUserProfile(userRow.id);
      const token = jwt.sign({ sub: userRow.id, role: user?.role }, JWT_SECRET, { expiresIn: '7d' });

      res.json({ token, user });
    } catch (err) {
      next(err);
    }
  });

  // ─── Forgot Password ────────────────────────────────────────────
  router.post('/api/auth/forgot-password', async (req, res, next) => {
    try {
      const { email } = req.body || {};
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const rows = await query(
        'SELECT id, email FROM users WHERE email = ? LIMIT 1',
        [email.toLowerCase().trim()]
      );

      if (!rows.length) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }

      const user = rows[0];
      const resetToken = jwt.sign({ sub: user.id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' });

      await query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())',
        [user.id, resetToken]
      );

      const userProfile = await getUserProfile(user.id);
      const userName = userProfile?.name || '';

      let emailResult;
      try {
        emailResult = await sendPasswordResetEmail(email, resetToken, userName);
        console.log(`Password reset email sent to: ${email}`);
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError.message);
      }

      if (process.env.NODE_ENV === 'development') {
        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        console.log(`[DEV] Reset link: ${resetLink}`);
        res.json({
          success: true,
          message: 'Password reset link has been sent to your email.',
          resetLink,
          previewUrl: emailResult?.previewUrl
        });
      } else {
        res.json({
          success: true,
          message: 'If an account exists with this email, a password reset link has been sent.'
        });
      }
    } catch (err) {
      next(err);
    }
  });

  // ─── Reset Password ─────────────────────────────────────────────
  router.post('/api/auth/reset-password', async (req, res, next) => {
    try {
      const { token, newPassword, password } = req.body || {};
      const pwd = newPassword || password;

      if (!token || !pwd) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }

      if (pwd.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters long' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.purpose !== 'password_reset') {
          return res.status(400).json({ error: 'Invalid reset token' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const tokenRows = await query(
        'SELECT id, user_id, used_at FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1',
        [token]
      );

      if (!tokenRows.length) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      const tokenRecord = tokenRows[0];
      if (tokenRecord.used_at) {
        return res.status(400).json({ error: 'This reset token has already been used' });
      }

      const passwordHash = await bcrypt.hash(pwd, 12);

      await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, decoded.sub]);
      await query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?', [tokenRecord.id]);

      const userRows = await query('SELECT email FROM users WHERE id = ? LIMIT 1', [decoded.sub]);
      if (userRows.length && userRows[0].email) {
        const userProfile = await getUserProfile(decoded.sub);
        sendPasswordResetConfirmationEmail(userRows[0].email, userProfile?.name || '').catch((err) =>
          console.error('Failed to send password reset confirmation:', err.message)
        );
      }

      res.json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.'
      });
    } catch (err) {
      next(err);
    }
  });

  // ─── Suspension Appeal ───────────────────────────────────────────
  router.post('/auth/suspension-appeal', async (req, res, next) => {
    try {
      const { appealToken, message, identifier } = req.body || {};
      if (!message) {
        return res.status(400).json({ error: 'message is required' });
      }

      let decoded;
      try {
        if (!appealToken) throw new Error('Missing appeal token');
        decoded = jwt.verify(appealToken, JWT_SECRET);
        if (decoded.purpose !== 'suspension_appeal') {
          return res.status(400).json({ error: 'Invalid appeal token' });
        }
      } catch (err) {
        decoded = null;
      }

      let userId = decoded?.sub || null;
      let userRows = [];

      if (!userId && identifier) {
        userRows = await query(
          'SELECT id, email, status FROM users WHERE email = ? OR phone = ? LIMIT 1',
          [identifier, identifier]
        );
        if (userRows.length) {
          userId = userRows[0].id;
        }
      }

      if (!userId) {
        return res.status(400).json({ error: 'Invalid or expired appeal token. Please log in again.' });
      }

      if (!userRows.length) {
        userRows = await query('SELECT id, email, status FROM users WHERE id = ? LIMIT 1', [userId]);
      }

      if (!userRows.length) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (userRows[0].status !== 'suspended') {
        return res.status(400).json({ error: 'User is not suspended' });
      }

      const existingAppeals = await query(
        `SELECT id, data FROM app_entities WHERE type = 'suspension_appeal' AND user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      if (existingAppeals.length) {
        try {
          const existingData = JSON.parse(existingAppeals[0].data || '{}');
          if ((existingData.status || 'pending') === 'pending') {
            return res.json({ success: true, appealId: existingAppeals[0].id, existing: true });
          }
        } catch {
          // ignore
        }
      }

      const appealId = uuidv4();
      const now = new Date();
      const payload = {
        id: appealId,
        userId,
        message,
        submittedAt: now.toISOString(),
        status: 'pending'
      };

      await query(
        `INSERT INTO app_entities (id, user_id, type, subtype, data, created_at, updated_at)
         VALUES (?, ?, 'suspension_appeal', NULL, ?, ?, ?)`,
        [appealId, userId, JSON.stringify(payload), now, now]
      );

      const savedAppeal = await query(
        `SELECT id FROM app_entities WHERE id = ? AND type = 'suspension_appeal' LIMIT 1`,
        [appealId]
      );
      if (!savedAppeal.length) {
        return res.status(500).json({ error: 'Failed to save appeal. Please try again.' });
      }

      // Notify system admins
      try {
        const systemRoleOptions = getRoleFilterOptions('system_admin');
        const systemRolePlaceholders = systemRoleOptions.map(() => '?').join(', ');
        await query(
          `INSERT INTO admin_notifications (id, sender_user_id, recipient_user_id, notification_type, priority, title, message, action_required, related_entity_type, related_entity_id)
           SELECT ?, ?, id, 'SUSPENSION_APPEAL', 'HIGH', ?, ?, TRUE, 'suspension_appeal', ?
           FROM users WHERE role IN (${systemRolePlaceholders})`,
          [uuidv4(), userId, 'Suspension Appeal Submitted', `A suspended user submitted a show-cause request. Appeal ID: ${appealId}`, appealId, ...systemRoleOptions]
        );
      } catch (notifyErr) {
        console.warn('Failed to create admin appeal notification:', notifyErr.message);
      }

      // Email system admins
      try {
        const systemRoleOptions = getRoleFilterOptions('system_admin');
        const systemRolePlaceholders = systemRoleOptions.map(() => '?').join(', ');
        const admins = await query(
          `SELECT email FROM users WHERE role IN (${systemRolePlaceholders}) AND email IS NOT NULL`,
          systemRoleOptions
        );
        const userProfileRows = await query(
          `SELECT u.email, COALESCE(p.full_name, 'User') as full_name
           FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ? LIMIT 1`,
          [userId]
        );
        const userEmail = userProfileRows[0]?.email || '';
        const userName = userProfileRows[0]?.full_name || 'User';

        await Promise.all(
          admins.map((admin) =>
            sendSuspensionAppealEmail(admin.email, {
              userEmail,
              userName,
              message,
              appealId,
              submittedAt: now.toISOString()
            })
          )
        );
      } catch (emailErr) {
        console.warn('Failed to send admin appeal email:', emailErr.message);
      }

      res.json({ success: true, appealId });
    } catch (err) {
      next(err);
    }
  });

  // ─── Get Current User ───────────────────────────────────────────
  router.get('/auth/me', requireAuth, checkSuspensionStatus, async (req, res, next) => {
    try {
      const user = await getUserProfile(req.user.sub);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
