# Payment Notification System

## Overview

The payment notification system automatically sends notifications to users and admins when payments are processed successfully.

## Features

### 1. User Notifications

When a payment is successful, the system automatically:

- Sends a notification to the user confirming payment success
- Includes payment details (amount, currency, worker name)
- Uses real-time WebSocket communication

### 2. Admin Notifications

When a worker is booked, the system automatically:

- Notifies all admins about the new booking
- Includes worker details, company, payment type, and amount
- Helps admins track business activity

## Implementation

### Payment Success Flow

```javascript
// In payment/success.js controller
if (session.payment_status === 'paid' && payment.status === 'pending') {
  payment.status = 'succeeded';
  await payment.save();

  // Send notifications
  await NotificationService.notifyPaymentSuccess(payment, user);
  await NotificationService.notifyWorkerBooking(payment, worker, user);
}
```

### Notification Types

#### Payment Success (User)

- **Event**: `payment_success`
- **Priority**: `medium`
- **Message**: "Payment of {amount} {currency} completed successfully for worker {workerName}"

#### Worker Booking (Admin)

- **Event**: `worker_booking`
- **Priority**: `high`
- **Message**: "Worker {workerName} from {companyName} has been booked by {userName} ({paymentType}) - Amount: {amount} {currency}"

## Error Handling

- Notifications are sent asynchronously
- If notification fails, payment process continues
- Errors are logged but don't affect payment success

## Real-time Features

- WebSocket integration for instant notifications
- Users see notifications immediately
- Admins get real-time booking alerts

## Usage Examples

### Frontend Notification Handling

```javascript
// Listen for payment success notifications
socket.on('new_notification', (data) => {
  if (data.event === 'payment_success') {
    showSuccessToast(data.message);
    updatePaymentStatus();
  }
});

// Admin booking notifications
socket.on('new_notification', (data) => {
  if (data.event === 'worker_booking') {
    updateAdminDashboard();
    showBookingAlert(data.message);
  }
});
```

### API Endpoints

```javascript
// Get user notifications
GET /api/notifications?page=1&limit=10&unreadOnly=true

// Mark notifications as read
PATCH /api/notifications/:id/read

// Get unread count
GET /api/notifications/unread-count
```

## Database Schema

```javascript
{
  recipient: ObjectId, // User who receives notification
  message: String,     // Notification text
  event: String,       // Type of event (payment_success, worker_booking)
  company: ObjectId,   // Related company (optional)
  priority: String,    // low, normal, high
  isRead: Boolean,     // Read status
  createdAt: Date,     // When notification was created
  updatedAt: Date      // Last modification
}
```

## Benefits

1. **Improved User Experience**: Users know immediately when payments succeed
2. **Admin Visibility**: Real-time awareness of business activity
3. **Automated Communication**: No manual notification needed
4. **Audit Trail**: All payment events are recorded
5. **Scalable**: Works with WebSocket for real-time updates
