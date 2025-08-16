import Notification from '../models/notification.js';
import catchAsync from './catchAsync.js';
import AppError from './appError.js';

const sendNotification = catchAsync(async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new AppError('Error sending notification', 500);
  }
});

export default sendNotification;
