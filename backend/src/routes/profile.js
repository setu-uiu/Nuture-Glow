/**
 * Profile routes: update name, avatar, etc.
 * Extracted from the monolithic index.js.
 */
import express from 'express';
import { query } from '../db.js';
import { getUserMeta, setUserMeta } from '../appStore.js';

/**
 * @param {{ requireAuth: Function, avatarUpload: object, buildPublicFileUrl: Function, removeUploadFileByUrl: Function, getUserProfile: Function }} deps
 */
export function createProfileRouter({ requireAuth, avatarUpload, buildPublicFileUrl, removeUploadFileByUrl, getUserProfile }) {
  const router = express.Router();

  router.put('/profile', requireAuth, async (req, res, next) => {
    try {
      const { name, preferred_language } = req.body || {};
      if (!name && !preferred_language) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      await query(
        'UPDATE user_profiles SET full_name = COALESCE(?, full_name), preferred_language = COALESCE(?, preferred_language) WHERE user_id = ?',
        [name || null, preferred_language || null, req.user.sub]
      );

      const user = await getUserProfile(req.user.sub);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  router.put('/profile/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res, next) => {
    try {
      const existingMeta = await getUserMeta(req.user.sub, ['avatar']);

      let avatarUrl = '';
      if (req.file) {
        avatarUrl = buildPublicFileUrl(req, `avatars/${req.file.filename}`);
      } else if (req.body?.avatar && typeof req.body.avatar === 'string') {
        avatarUrl = req.body.avatar.trim();
      }

      if (!avatarUrl) {
        return res.status(400).json({ error: 'avatar is required' });
      }

      await setUserMeta(req.user.sub, { avatar: avatarUrl });

      const previousAvatar = existingMeta.avatar;
      if (req.file && previousAvatar && previousAvatar !== avatarUrl) {
        try {
          await removeUploadFileByUrl(previousAvatar);
        } catch (cleanupErr) {
          console.warn('Failed to clean old avatar file:', cleanupErr.message || cleanupErr);
        }
      }

      const user = await getUserProfile(req.user.sub);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
