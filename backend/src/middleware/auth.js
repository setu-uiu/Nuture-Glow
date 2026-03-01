/**
 * Authentication & authorization middleware.
 * Extracted from index.js for single-responsibility separation.
 */
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { normalizeRoleValue } from '../roles.js';

/**
 * Create the JWT secret, handling dev/prod environments.
 * @param {string} nodeEnv
 * @param {function} loadDevJwtSecret - fallback for dev environments
 * @returns {string}
 */
export function resolveJwtSecret(nodeEnv, loadDevJwtSecret) {
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
    return process.env.JWT_SECRET;
  }
  if (nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set to a 32+ char value in production.');
  }
  console.warn('JWT_SECRET is missing or too short. Using a persisted dev secret.');
  return loadDevJwtSecret();
}

/**
 * Factory: creates the four core middleware functions that depend on JWT_SECRET.
 *
 * @param {string} JWT_SECRET
 * @returns {{ requireAuth, checkSuspensionStatus, requireRole, requireConsentForPatient }}
 */
export function createAuthMiddleware(JWT_SECRET) {
  /**
   * Verify the Bearer token and attach `req.user`.
   */
  function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload && payload.role) {
        payload.role = normalizeRoleValue(payload.role) || payload.role;
      }
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  /**
   * Check if the authenticated user's account has been suspended.
   */
  function checkSuspensionStatus(req, res, next) {
    return (async () => {
      try {
        if (!req.user || !req.user.sub) return next();
        const rows = await query(
          `SELECT data FROM app_entities WHERE type = 'user_suspension' AND user_id = ? ORDER BY created_at DESC LIMIT 1`,
          [req.user.sub]
        );
        if (rows.length > 0) {
          try {
            const suspension = JSON.parse(rows[0].data || '{}');
            if (suspension.status === 'suspended') {
              return res.status(403).json({ error: 'Account suspended', reason: suspension.reason });
            }
          } catch (e) {
            // corrupted JSON — skip
          }
        }
        next();
      } catch (err) {
        console.error('Suspension check error:', err);
        next();
      }
    })();
  }

  /**
   * Role-based access control.  Accepts one or more allowed role names.
   */
  function requireRole(...allowedRoles) {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.sub) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const normalizedAllowed = allowedRoles
          .flatMap((role) => (Array.isArray(role) ? role : [role]))
          .map((role) => normalizeRoleValue(role));

        const rows = await query(
          `SELECT role FROM users WHERE id = ? LIMIT 1`,
          [req.user.sub]
        );

        const rawRole = rows.length > 0 && rows[0].role ? rows[0].role : 'mother';
        const userRole = normalizeRoleValue(rawRole);

        if (!normalizedAllowed.includes(userRole)) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            required: allowedRoles,
            current: rawRole
          });
        }

        req.userRole = userRole;
        if (req.user) {
          req.user.role = userRole;
        }
        next();
      } catch (err) {
        console.error('Role check error:', err);
        return res.status(500).json({ error: 'Role verification failed' });
      }
    };
  }

  /**
   * Ensures that the requesting doctor has active consent from the patient
   * identified by `patientIdParam` in path params or body.
   */
  function requireConsentForPatient(patientIdParam = 'patientId') {
    return async (req, res, next) => {
      try {
        if (!req.user || !req.user.sub) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const doctorId = req.user.sub;
        const patientId = req.params[patientIdParam] || req.body.patientId;

        if (!patientId) {
          return res.status(400).json({ error: 'Patient ID required' });
        }

        const consentRows = await query(
          `SELECT id, data FROM app_entities 
           WHERE type = 'medical_consent' 
           AND user_id = ?
           LIMIT 100`,
          [patientId]
        );

        const now = new Date();
        const activeConsent = consentRows.find((row) => {
          try {
            const consent = JSON.parse(row.data || '{}');
            if (consent.doctorId !== doctorId) return false;
            if (consent.status !== 'active') return false;
            if (consent.expiresAt) {
              const expiryDate = new Date(consent.expiresAt);
              if (now > expiryDate) return false;
            }
            return true;
          } catch {
            return false;
          }
        });

        if (!activeConsent) {
          return res.status(403).json({
            error: 'Access denied: Patient consent required',
            reason: 'no_active_consent',
            hint: 'Request patient consent before accessing their medical data'
          });
        }

        req.consentId = activeConsent.id;
        req.consentValidated = true;
        next();
      } catch (err) {
        console.error('Consent validation error:', err);
        return res.status(500).json({ error: 'Consent verification failed' });
      }
    };
  }

  return { requireAuth, checkSuspensionStatus, requireRole, requireConsentForPatient };
}
