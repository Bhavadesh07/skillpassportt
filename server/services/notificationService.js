import { store } from '../store.js';

export const NotificationService = {
  sendNotification({ userId, title, message, notificationType = 'info', actionLink = null }) {
    return store.createNotification({
      user_id: userId,
      title,
      message,
      notification_type: notificationType,
      action_link: actionLink,
      is_read: false,
    });
  },

  notifyAdmins({ title, message, notificationType = 'warning' }) {
    const admins = store.users.filter((u) => u.role === 'admin');
    for (const admin of admins) {
      this.sendNotification({
        userId: admin.id,
        title,
        message,
        notificationType,
        actionLink: '#admin/monitor',
      });
    }
  },

  getUserNotifications(userId, limit = 30) {
    return store.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  },

  markAsRead(notificationId, userId) {
    const notif = store.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (notif) {
      notif.is_read = true;
      return true;
    }
    return false;
  },

  markAllAsRead(userId) {
    let count = 0;
    for (const n of store.notifications) {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        count += 1;
      }
    }
    return count;
  },
};
