import Notification from '../models/notification.js';
import User from '../models/userModel.js';
import socketService from './socketService.js';

class NotificationService {
  // Create a single notification
  static async createNotification(data) {
    const notification = new Notification(data);
    await notification.save();

    // Send real-time notification
    socketService.sendToUser(data.recipient, 'new_notification', {
      notification: notification.toObject(),
      message: data.message,
      event: data.event,
      priority: data.priority,
    });

    return notification;
  }

  // Create bulk notifications (for admins)
  static async createBulkNotifications(recipients, messageData) {
    const notifications = recipients.map((recipientId) => ({
      recipient: recipientId,
      message: messageData.message,
      event: messageData.event,
      company: messageData.company,
      priority: messageData.priority,
    }));

    const result = await Notification.insertMany(notifications);
    console.log('Bulk notifications created:', result);

    // Send real-time notifications to all recipients
    socketService.sendToAdmins('new_notification', {
      message: messageData.message,
      event: messageData.event,
      priority: messageData.priority,
    });

    return result;
  }

  // Get all admin users
  static async getAllAdmins() {
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      return admins.map((admin) => admin._id);
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  }

  // Company registration notification (to all admins)
  static async notifyCompanyRegistration(company) {
    try {
      const admins = await this.getAllAdmins();
      if (admins.length === 0) return;

      const messageData = {
        message: `New company "${company.companyName}" registered and needs approval`,
        event: 'company_registration',
        company: company._id,
        priority: 'high',
      };

      return await this.createBulkNotifications(admins, messageData);
    } catch (error) {
      console.error('Error notifying company registration:', error);
      throw error;
    }
  }

  // Company approval notification (to company owner)
  static async notifyCompanyApproval(company) {
    try {
      const messageData = {
        recipient: company.user,
        message: `Your company "${company.companyName}" has been approved`,
        event: 'company_approved',
        company: company._id,
        priority: 'high',
      };

      return await this.createNotification(messageData);
    } catch (error) {
      console.error('Error notifying company approval:', error);
      throw error;
    }
  }

  // Company rejection notification (to company owner)
  static async notifyCompanyRejection(company) {
    try {
      const messageData = {
        recipient: company.user,
        message: `Your company "${company.companyName}" has been rejected, contact support for more details ${process.env.CONTACT_US}`,
        event: 'company_rejected',
        company: company._id,
        priority: 'high',
      };

      return await this.createNotification(messageData);
    } catch (error) {
      console.error('Error notifying company rejection:', error);
      throw error;
    }
  }

  // Get notifications for a user with pagination
  static async getUserNotifications(
    userId,
    page = 1,
    limit = 10,
    unreadOnly = true
  ) {
    try {
      const skip = (page - 1) * limit;
      const filter = { recipient: userId };

      if (unreadOnly) {
        filter.isRead = false;
      }

      const notifications = await Notification.find(filter)
        .populate('company', 'companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(filter);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true },
        { new: true }
      );
      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { isRead: true }
      );
      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread count for a user
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });
      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId,
      });
      return notification;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

export default NotificationService;
