import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifyTest,
} from '../../controllers/notification/index.js';
import { isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Protect all notification routes
router.use(isAuthenticated);

// Get notifications for the authenticated user
router.get('/', getNotifications);

// Get unread notifications count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.post('/test', notifyTest);
router.delete('/:id', deleteNotification);

export default router;
