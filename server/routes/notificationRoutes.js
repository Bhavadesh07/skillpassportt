import express from 'express';
import { store } from '../store.js';
import { getCurrentUser } from '../auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();

function formatDateTime(iso) {
  return iso ? iso.slice(0, 16).replace('T', ' ') : null;
}

router.get('/', getCurrentUser, (req, res) => {
  const limit = parseInt(req.query.limit || '30', 10);
  const notifs = NotificationService.getUserNotifications(req.user.id, limit);
  return res.json(
    notifs.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.notification_type,
      action_link: n.action_link,
      is_read: n.is_read,
      created_at: formatDateTime(n.created_at),
    }))
  );
});

router.get('/unread-count', getCurrentUser, (req, res) => {
  const count = store.notifications.filter((n) => n.user_id === req.user.id && !n.is_read).length;
  return res.json({ unread_count: count });
});

router.patch('/:notifId/read', getCurrentUser, (req, res) => {
  const notifId = parseInt(req.params.notifId, 10);
  const success = NotificationService.markAsRead(notifId, req.user.id);
  if (!success) {
    return res.status(404).json({ detail: 'Notification not found.' });
  }
  return res.json({ message: 'Marked as read.' });
});

router.post('/read-all', getCurrentUser, (req, res) => {
  const count = NotificationService.markAllAsRead(req.user.id);
  return res.json({ message: `Marked ${count} notifications as read.` });
});

export default router;
