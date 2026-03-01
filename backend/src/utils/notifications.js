/**
 * Shared notification helper.
 * Used by both appRoutes.js and adminRoutes.js.
 */
import { createEntity } from '../appStore.js';

export const createNotification = async (userId, payload) => {
  const notification = {
    userId,
    type: payload.type,
    entityId: payload.entityId,
    title: payload.title,
    message: payload.message,
    link: payload.link,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  await createEntity({ type: 'notification', userId, data: notification });
};
