import NotificationService from '../../utils/notificationService.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';

// Get user notifications with pagination
export const getNotifications = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, unreadOnly = false } = req.query;
  const userId = req.user.id;
  console.log(userId);

  const result = await NotificationService.getUserNotifications(
    userId,
    parseInt(page),
    parseInt(limit),
    unreadOnly === 'true'
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

// Get unread notifications count
export const getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const count = await NotificationService.getUnreadCount(userId);

  res.status(200).json({
    status: 'success',
    data: { count },
  });
});

// Mark notification as read
export const markAsRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await NotificationService.markAsRead(id, userId);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
    data: { notification },
  });
});

// Mark all notifications as read
export const markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const result = await NotificationService.markAllAsRead(userId);

  res.status(200).json({
    status: 'success',
    data: { modifiedCount: result.modifiedCount },
  });
});

// Delete notification
export const deleteNotification = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await NotificationService.deleteNotification(id, userId);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const notifyTest = catchAsync(async (req, res, next) => {
  const { userId, message } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required for test notification', 400));
  }
  const notification = await NotificationService.createNotification({
    recipient: userId,
    message: message || 'Test notification',
    event: 'test_event',
    priority: 'normal',
  });

  res.status(201).json({
    status: 'success',
    data: { notification },
  });
});
