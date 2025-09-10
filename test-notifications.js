// Test script to demonstrate payment notifications
import NotificationService from './services/notificationService.js';

// Example usage of payment notifications
async function testPaymentNotifications() {
  try {
    // Mock data for testing
    const mockPayment = {
      _id: '507f1f77bcf86cd799439011',
      amount: 500,
      currency: 'AED',
      paymentType: 'deposit',
      worker: {
        fullName: 'Ahmed Hassan',
      },
    };

    const mockUser = {
      _id: '507f1f77bcf86cd799439012',
      fullName: 'Sarah Smith',
      email: 'sarah@example.com',
    };

    const mockWorker = {
      _id: '507f1f77bcf86cd799439013',
      fullName: 'Ahmed Hassan',
      company: {
        _id: '507f1f77bcf86cd799439014',
        companyName: 'Premium Cleaning Services',
      },
    };

    console.log('🔔 Testing Payment Success Notification (to user)...');
    const userNotification = await NotificationService.notifyPaymentSuccess(
      mockPayment,
      mockUser
    );
    console.log('✅ User notification created:', userNotification.message);

    console.log('\n🔔 Testing Worker Booking Notification (to admins)...');
    const adminNotifications = await NotificationService.notifyWorkerBooking(
      mockPayment,
      mockWorker,
      mockUser
    );
    console.log('✅ Admin notifications created:', adminNotifications.length);

    console.log('\n📋 Notification Examples:');
    console.log('User Message:', userNotification.message);
    console.log(
      'Admin Message:',
      `Worker "Ahmed Hassan" from "Premium Cleaning Services" has been booked by "Sarah Smith" (deposit payment) - Amount: 500 AED`
    );
  } catch (error) {
    console.error('❌ Error testing notifications:', error.message);
  }
}

// Uncomment to run the test
// testPaymentNotifications();

export { testPaymentNotifications };
