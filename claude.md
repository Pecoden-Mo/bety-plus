# Buty Plus - Complete Documentation for Claude

This file consolidates all markdown documentation from the Buty Plus project for Claude AI assistant context.

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Payment System Status](#payment-system-status)
3. [Updated Payment System](#updated-payment-system)
4. [Payment Notifications](#payment-notifications)
5. [Notification API](#notification-api)
6. [Email Optimization](#email-optimization)
7. [Todo List](#todo-list)
8. [Tests README](#tests-readme)

---

# Project Summary

## Project Overview

Buty Plus is a comprehensive backend API for a domestic worker booking platform that connects customers with domestic workers (housemaids, babysitters, elderly care) through registered companies. The platform operates primarily in the UAE and surrounding regions with specialized payment logic for different geographical locations.

## 🏗️ Architecture & Technology Stack

### **Backend Technology**

- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with role-based access control
- **Payment Processing**: Stripe integration for secure payments
- **File Storage**: Express file upload support
- **Real-time Communication**: Socket.IO for notifications
- **Validation**: Express-validator for input validation
- **Security**: bcryptjs for password hashing, CORS enabled

### **Project Structure**

```
backend/
├── config/           # Database, passport, rate limiting configurations
├── controllers/      # Request handlers organized by feature
├── middleware/       # Authentication, validation, error handling
├── models/          # MongoDB schemas and models
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utilities, validators, helpers
└── tests/           # Testing infrastructure
```

## 👥 User Roles & Authentication

### **User Types**

1. **Customer** - Books domestic workers
2. **Company** - Manages and provides workers
3. **Admin** - Platform administration and oversight

### **Authentication Features**

- Email/password registration and login
- Social authentication (Google, Apple, Microsoft)
- JWT token-based sessions
- Password reset functionality
- Role-based access control (RBAC)

## 📋 Core Features

### **Worker Management**

- Worker profiles with skills, experience, and availability
- Company-worker associations
- Worker location and service area management
- Availability scheduling

### **Booking System**

- Customer booking requests
- Real-time availability checking
- Booking confirmation and management
- Service scheduling

### **Payment Processing**

- Stripe integration for secure payments
- Multiple payment types (deposit, full payment)
- Regional pricing variations
- Trial periods for UAE inside customers
- Payment history and receipts

### **Notification System**

- Real-time notifications via Socket.IO
- Email notifications for important events
- In-app notification management
- Admin notification dashboard

## 💰 Payment System Architecture

### **Payment Types**

1. **Deposit Payment** - Initial booking with trial period
2. **Full Payment** - Complete service payment upfront
3. **Remaining Payment** - Balance after deposit trial

### **Regional Logic**

- **UAE Inside**: 7-day trial period available
- **UAE Outside**: Direct full payment required
- **Other Regions**: Standard pricing applies

### **Payment Flow**

1. Customer selects worker and service
2. Pricing calculated based on location and service type
3. Stripe checkout session created
4. Payment processed and confirmed
5. Worker availability updated
6. Notifications sent to relevant parties

## 🔔 Notification Architecture

### **Notification Types**

- Payment confirmations
- Booking updates
- Worker assignments
- Admin alerts
- System notifications

### **Delivery Channels**

- Real-time (Socket.IO)
- Email (SMTP)
- In-app notifications
- Database persistence

## 🗄️ Database Schema

### **Core Models**

- **User**: Customers and admins
- **Company**: Service providers
- **Worker**: Domestic workers
- **Payment**: Transaction records
- **Pricing**: Service pricing rules
- **Notification**: System notifications

### **Key Relationships**

- Companies have many Workers
- Users have many Payments
- Payments reference User, Worker, and Company
- Notifications target specific Users

## 🔐 Security Features

### **Authentication Security**

- JWT token validation
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Session management

### **Data Protection**

- Input validation and sanitization
- MongoDB injection prevention
- CORS configuration
- Environment variable security

## 📱 API Structure

### **Main Route Groups**

- `/api/v1/auth` - Authentication endpoints
- `/api/v1/users` - User management
- `/api/v1/companies` - Company operations
- `/api/v1/workers` - Worker management
- `/api/v1/payments` - Payment processing
- `/api/v1/pricing` - Pricing management
- `/api/v1/admin` - Admin operations
- `/api/v1/notifications` - Notification system

### **Response Format**

```json
{
  "status": "success|error|fail",
  "message": "Human readable message",
  "data": { ... },
  "errors": [ ... ]
}
```

## 🧪 Testing Infrastructure

### **Test Coverage**

- Unit tests for business logic
- Integration tests for API endpoints
- Payment processing tests
- Authentication flow tests

### **Test Tools**

- Jest testing framework
- Supertest for API testing
- MongoDB Memory Server for test database

## 🚀 Deployment & Environment

### **Environment Variables**

- Database connection strings
- JWT secrets
- Stripe API keys
- SMTP configuration
- Social auth credentials

### **Production Considerations**

- SSL/TLS encryption
- Database connection pooling
- Error monitoring
- Performance optimization
- Backup strategies

## 📈 Performance Optimizations

### **Database Optimization**

- Proper indexing strategies
- Query optimization
- Connection pooling
- Aggregation pipelines

### **API Performance**

- Response caching where appropriate
- Efficient pagination
- Rate limiting
- Compression middleware

---

# Payment System Status

## Current Payment System Implementation

### Overview

The Buty Plus payment system is built on Stripe integration with support for multiple payment types, regional pricing, and trial periods. The system handles complex scenarios including deposit payments with trial periods and location-based pricing.

### Payment Types Supported

#### 1. Full Payment

- Complete payment for annual service
- No trial period
- Immediate worker assignment
- Service period: 365 days from payment

#### 2. Deposit Payment (Trial)

- Initial payment for trial period
- Available for UAE inside customers
- Trial period: 7 days
- Requires remaining payment after trial

#### 3. Remaining Payment

- Balance payment after trial period
- Converts trial to full annual service
- Links to original deposit payment

### Regional Pricing Logic

#### UAE Inside Customers

- **Option 1**: Deposit payment (10-20% of full amount) + 7-day trial
- **Option 2**: Full payment for immediate annual service
- **Trial Period**: 7 days to evaluate worker
- **Post-Trial**: Must pay remaining amount or worker returns

#### UAE Outside Customers

- **Payment Type**: Full payment only
- **No Trial**: Immediate annual service
- **Service Period**: 365 days from payment

### Payment Flow Architecture

```
Customer Request → Pricing Calculation → Stripe Session → Payment Success → Worker Assignment
```

#### Detailed Flow:

1. **Pricing Calculation**
   - Base price from pricing model
   - Service fee calculation
   - Delivery fee (if applicable)
   - Regional adjustments

2. **Stripe Integration**
   - Create customer if new
   - Generate payment intent
   - Create checkout session
   - Handle webhooks for confirmation

3. **Payment Confirmation**
   - Update payment status
   - Reserve worker
   - Send notifications
   - Calculate service end dates

### Database Schema

#### Payment Model

```javascript
{
  user: ObjectId,
  worker: ObjectId,
  company: ObjectId,
  pricing: {
    basePrice: Number,
    serviceFee: Number,
    deliveryFee: Number,
    totalAmount: Number,
    currency: String
  },
  paymentType: ['deposit', 'full', 'remaining'],
  trialInfo: {
    isTrialPayment: Boolean,
    trialDays: Number,
    originalFullAmount: Number,
    trialStartDate: Date,
    trialEndDate: Date
  },
  relatedPayments: {
    depositPaymentId: ObjectId,
    remainingPaymentId: ObjectId
  },
  status: ['pending', 'succeeded', 'failed', 'refunded'],
  workerDeployment: {
    status: ['pending_dispatch', 'dispatched', 'arrived'],
    dispatchDate: Date,
    actualArrivalDate: Date
  },
  endDate: Date
}
```

### Current Issues and Limitations

#### Known Issues:

1. **Worker Availability**: Need better conflict resolution for overlapping bookings
2. **Refund Logic**: Complex refund scenarios need improvement
3. **Trial Extension**: No mechanism for extending trial periods
4. **Payment Retry**: Limited retry logic for failed payments

#### Technical Debt:

1. **Error Handling**: Inconsistent error responses across payment endpoints
2. **Validation**: Some edge cases not properly validated
3. **Logging**: Payment audit trail could be more comprehensive
4. **Testing**: Need more comprehensive payment integration tests

### Security Implementation

#### Payment Security:

- Stripe handles sensitive payment data
- PCI compliance through Stripe
- Webhook signature verification
- Payment intent validation

#### Data Protection:

- Payment method details stored securely
- Customer data encryption
- Audit logging for payment events
- Rate limiting on payment endpoints

### Monitoring and Analytics

#### Payment Metrics:

- Success/failure rates
- Average payment amounts
- Regional payment distribution
- Trial conversion rates

#### Alert System:

- Failed payment notifications
- Unusual payment patterns
- Refund requests
- Payment disputes

### Integration Points

#### External Services:

- **Stripe**: Payment processing
- **MongoDB**: Data persistence
- **Socket.IO**: Real-time notifications
- **SMTP**: Email confirmations

#### Internal Services:

- **User Service**: Customer management
- **Worker Service**: Availability management
- **Notification Service**: Event notifications
- **Pricing Service**: Dynamic pricing

---

# Updated Payment System

## Enhanced Payment System with Worker Deployment Tracking

### New Features Added

#### 1. Worker Deployment Status Tracking

The payment system now includes comprehensive tracking of worker deployment from payment to service start:

**Deployment Statuses:**

- `pending_dispatch` - Payment completed, worker not yet sent
- `dispatched` - Worker has been sent to customer location
- `arrived` - Worker has arrived at customer location
- `service_started` - Admin confirmed arrival, service period begins

#### 2. Admin Approval System

Added admin controls for worker deployment management:

**Admin Capabilities:**

- View all payments with deployment status
- Update worker deployment status
- Track dispatch and arrival times
- Approve worker arrivals to start service periods

#### 3. Service Period Management

Enhanced logic for when service periods actually begin:

**Previous Behavior:**

- Service period started from payment success time
- No tracking of actual worker arrival

**New Behavior:**

- Service period starts only when worker arrives
- Admin must confirm arrival to activate service
- Trial and full payment periods calculated from arrival time

### Technical Implementation

#### Enhanced Payment Model

```javascript
workerDeployment: {
  status: {
    type: String,
    enum: ['pending_dispatch', 'dispatched', 'arrived'],
    default: 'pending_dispatch'
  },
  dispatchDate: Date,
  actualArrivalDate: Date
}
```

#### Admin Controller Functions

```javascript
// Get all payments with deployment info
getAllPaymentsWithDeployment();

// Update worker deployment status
updateWorkerDeploymentStatus();

// Get specific payment deployment details
getPaymentDeploymentDetails();

// Get deployment statistics
getDeploymentStats();
```

#### Pre-save Middleware Update

```javascript
// Only set end dates when worker arrives, not when payment succeeds
if (
  this.isModified('workerDeployment.status') &&
  this.workerDeployment.status === 'arrived'
) {
  // Calculate service periods from arrival time
  // Set trial end dates or full service end dates
}
```

### API Endpoints

#### Admin Payment Management

```
GET /admin/payments - List all payments with deployment status
GET /admin/payments/stats - Get deployment statistics
GET /admin/payments/:paymentId - Get specific payment details
PATCH /admin/payments/:paymentId/deployment - Update deployment status
```

#### Usage Examples

```javascript
// Update worker deployment status
PATCH /admin/payments/:paymentId/deployment
Body: { "status": "arrived" }

// Get payments by deployment status
GET /admin/payments?status=dispatched&page=1&limit=10
```

### Business Logic Changes

#### Payment Success Flow

1. **Payment Succeeds** → Status: `pending_dispatch`
2. **Admin Dispatches Worker** → Status: `dispatched`, sets `dispatchDate`
3. **Worker Arrives** → Status: `arrived`, sets `actualArrivalDate`
4. **Service Periods Begin** → Calculate trial/full service end dates

#### Trial Period Logic

```javascript
// For deposit payments
if (paymentType === 'deposit' && status === 'arrived') {
  trialStartDate = arrivalTime;
  trialEndDate = arrivalTime + trialDays;
}

// For full payments
if (paymentType === 'full' && status === 'arrived') {
  endDate = arrivalTime + 365 days;
}
```

### Dashboard Features

#### Admin Dashboard Stats

- Total payments by deployment status
- Recent arrivals (last 7 days)
- Overdue dispatches (dispatched but not arrived)
- Average dispatch-to-arrival time

#### Deployment Timeline View

- Payment success timestamp
- Dispatch timestamp
- Arrival timestamp
- Service start timestamp

### Benefits of Updated System

#### 1. Accurate Service Tracking

- Service periods only count from actual worker arrival
- No wasted time if worker is delayed
- Fair billing for customers

#### 2. Better Customer Experience

- Transparency in worker deployment process
- Accurate service start notifications
- No confusion about service periods

#### 3. Operational Control

- Admin oversight of worker deployments
- Ability to track and resolve delays
- Performance metrics for dispatch efficiency

#### 4. Financial Accuracy

- Service periods aligned with actual service delivery
- No billing for services not yet started
- Clear audit trail for service periods

### Migration Considerations

#### Existing Data

- Existing payments retain current behavior
- New payments use enhanced deployment tracking
- Historical data remains unchanged

#### Backward Compatibility

- API responses include new fields
- Existing integrations continue to work
- Optional fields for deployment status

---

# Payment Notifications

## Comprehensive Notification System for Payment Events

### Overview

The payment notification system provides real-time updates and email communications for all payment-related events in the Buty Plus platform. It ensures customers, companies, and admins stay informed throughout the payment and service delivery process.

### Notification Types

#### 1. Payment Success Notifications

**Trigger**: When payment status changes to 'succeeded'
**Recipients**: Customer, Company, Admins
**Channels**: Socket.IO, Email, In-app

**Customer Notification:**

```
Subject: Payment Confirmed - Worker Booking
Content: Your payment of $XXX has been confirmed. Worker [Name] will be assigned to you.
Details: Payment ID, Worker info, Service dates, Receipt URL
```

**Company Notification:**

```
Subject: New Booking Received
Content: Customer [Name] has booked worker [Worker Name]
Details: Customer info, Payment amount, Service requirements
```

#### 2. Worker Dispatch Notifications

**Trigger**: When workerDeployment.status changes to 'dispatched'
**Recipients**: Customer
**Channels**: Socket.IO, Email, SMS (future)

```
Subject: Your Worker is On the Way
Content: Worker [Name] has been dispatched to your location
Details: Expected arrival time, Worker contact info, Tracking info
```

#### 3. Worker Arrival Notifications

**Trigger**: When workerDeployment.status changes to 'arrived'
**Recipients**: Customer, Company, Admins
**Channels**: Socket.IO, Email

```
Subject: Worker Has Arrived - Service Starting
Content: Worker [Name] has arrived and your service period is now beginning
Details: Service start date, Service end date, Worker contact
```

#### 4. Trial Period Notifications

**Trigger**: Various trial-related events
**Recipients**: Customer
**Channels**: Email, In-app

**Trial Start:**

```
Subject: 7-Day Trial Period Started
Content: Your trial period with worker [Name] has begun
Details: Trial end date, Remaining payment amount, How to continue
```

**Trial Reminder (Day 5):**

```
Subject: Trial Period Ending Soon
Content: Your 7-day trial ends in 2 days
Details: Options to continue, Payment deadline, Worker performance feedback
```

**Trial End:**

```
Subject: Trial Period Ended
Content: Your trial period has ended. Choose to continue or end service.
Details: Payment options, Worker return process, Feedback request
```

#### 5. Payment Failure Notifications

**Trigger**: When payment status changes to 'failed'
**Recipients**: Customer, Admins
**Channels**: Socket.IO, Email

```
Subject: Payment Failed - Action Required
Content: Your payment could not be processed
Details: Error reason, Retry options, Alternative payment methods
```

#### 6. Refund Notifications

**Trigger**: When refund is processed
**Recipients**: Customer, Admins
**Channels**: Email

```
Subject: Refund Processed
Content: Your refund of $XXX has been processed
Details: Refund amount, Processing time, Transaction ID
```

### Notification Architecture

#### Socket.IO Real-time Notifications

```javascript
// Real-time notification structure
{
  event: 'payment_success',
  data: {
    paymentId: 'pay_xxx',
    message: 'Payment confirmed',
    amount: 1500,
    worker: { name: 'John Doe', id: 'worker_123' },
    timestamp: '2024-01-15T10:30:00Z'
  }
}
```

#### Email Template System

```javascript
// Email template structure
{
  template: 'payment_success',
  variables: {
    customerName: 'Jane Smith',
    workerName: 'John Doe',
    amount: '$1,500',
    paymentId: 'pay_xxx',
    serviceStartDate: '2024-01-16',
    serviceEndDate: '2025-01-16'
  }
}
```

#### Database Notification Storage

```javascript
{
  userId: ObjectId,
  type: 'payment_success',
  title: 'Payment Confirmed',
  message: 'Your payment has been processed successfully',
  data: {
    paymentId: 'pay_xxx',
    amount: 1500,
    workerId: 'worker_123'
  },
  read: false,
  readAt: null,
  createdAt: Date,
  expiresAt: Date
}
```

### Notification Service Implementation

#### Core Service Methods

```javascript
class NotificationService {
  // Send payment success notifications
  static async notifyPaymentSuccess(payment, user)

  // Send worker dispatch notifications
  static async notifyWorkerDispatched(payment, user)

  // Send worker arrival notifications
  static async notifyWorkerArrived(payment, user)

  // Send trial period notifications
  static async notifyTrialStart(payment, user)
  static async notifyTrialReminder(payment, user)
  static async notifyTrialEnd(payment, user)

  // Send payment failure notifications
  static async notifyPaymentFailed(payment, user, error)

  // Send refund notifications
  static async notifyRefundProcessed(payment, user, refundAmount)
}
```

#### Bulk Notification Support

```javascript
// Send to multiple users
static async createBulkNotifications(userIds, messageData)

// Send to all admins
static async notifyAllAdmins(messageData)

// Send to company users
static async notifyCompanyUsers(companyId, messageData)
```

### Email Templates

#### Payment Success Template

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Payment Confirmed - Buty Plus</title>
  </head>
  <body>
    <div
      style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;"
    >
      <h2>Payment Confirmed!</h2>
      <p>Dear {{customerName}},</p>
      <p>Your payment has been successfully processed.</p>

      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0;">
        <h3>Booking Details</h3>
        <p><strong>Worker:</strong> {{workerName}}</p>
        <p><strong>Amount:</strong> {{amount}}</p>
        <p>
          <strong>Service Period:</strong> {{serviceStartDate}} to
          {{serviceEndDate}}
        </p>
        <p><strong>Payment ID:</strong> {{paymentId}}</p>
      </div>

      <p>
        Your worker will be dispatched shortly. You'll receive another
        notification when they're on the way.
      </p>

      <a
        href="{{receiptUrl}}"
        style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;"
        >View Receipt</a
      >
    </div>
  </body>
</html>
```

#### Worker Dispatch Template

```html
<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
  <h2>Your Worker is On the Way!</h2>
  <p>Dear {{customerName}},</p>
  <p>{{workerName}} has been dispatched to your location.</p>

  <div style="background: #e7f3ff; padding: 20px; margin: 20px 0;">
    <h3>Arrival Information</h3>
    <p><strong>Expected Arrival:</strong> {{expectedArrival}}</p>
    <p><strong>Worker Contact:</strong> {{workerPhone}}</p>
    <p><strong>Company:</strong> {{companyName}}</p>
  </div>

  <p>Please ensure someone is available to receive the worker.</p>
</div>
```

### Notification Preferences

#### User Preference Settings

```javascript
{
  userId: ObjectId,
  emailNotifications: {
    paymentSuccess: true,
    workerDispatch: true,
    workerArrival: true,
    trialReminders: true,
    paymentFailures: true
  },
  pushNotifications: {
    realTime: true,
    marketing: false
  },
  smsNotifications: {
    urgent: true,
    reminders: false
  }
}
```

#### Notification Scheduling

```javascript
// Schedule trial reminder
await scheduleNotification({
  userId: user._id,
  type: 'trial_reminder',
  scheduledFor: trialEndDate - 2 days,
  data: { paymentId: payment._id }
});
```

### Error Handling and Reliability

#### Retry Logic

```javascript
// Exponential backoff for failed notifications
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  exponential: true,
};
```

#### Fallback Mechanisms

```javascript
// If Socket.IO fails, use email
// If email fails, store in database for manual sending
// If all fail, log for admin attention
```

#### Monitoring and Alerts

```javascript
// Track notification success rates
// Alert admins if failure rate exceeds threshold
// Monitor delivery times and performance
```

### Integration with Payment Flow

#### Payment Success Handler

```javascript
// In payment success controller
if (session.payment_status === 'paid' && payment.status === 'pending') {
  payment.status = 'succeeded';
  await payment.save();

  // Send notifications
  await NotificationService.notifyPaymentSuccess(payment, user);

  // Notify admins about new booking
  await NotificationService.notifyWorkerBooking(payment, worker, user);
}
```

#### Worker Deployment Handler

```javascript
// In admin deployment update
payment.workerDeployment.status = status;
await payment.save();

// Send appropriate notifications
switch (status) {
  case 'dispatched':
    await NotificationService.notifyWorkerDispatched(payment, payment.user);
    break;
  case 'arrived':
    await NotificationService.notifyWorkerArrived(payment, payment.user);
    break;
}
```

---

# Notification API

## Real-time Notification System API Documentation

### Overview

The Notification API provides comprehensive real-time messaging capabilities for the Buty Plus platform using Socket.IO for instant delivery and persistent storage for reliability.

### Socket.IO Implementation

#### Connection Setup

```javascript
// Client connection
const socket = io('http://localhost:3020', {
  auth: {
    token: 'jwt_token_here',
  },
});

// Server authentication
socket.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});
```

#### Event Structure

```javascript
// Standard notification event format
{
  event: 'notification',
  data: {
    id: 'notification_id',
    type: 'payment_success',
    title: 'Payment Confirmed',
    message: 'Your payment has been processed successfully',
    priority: 'high',
    timestamp: '2024-01-15T10:30:00Z',
    data: {
      paymentId: 'pay_xxx',
      amount: 1500,
      workerId: 'worker_123'
    },
    actionUrl: '/payments/pay_xxx',
    read: false
  }
}
```

### Socket.IO Service Class

#### Core Service Implementation

```javascript
class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
  }

  // Initialize Socket.IO server
  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
      },
    });

    this.setupEventHandlers();
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets && userSockets.length > 0) {
      userSockets.forEach((socketId) => {
        this.io.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  // Send notification to all admins
  sendToAdmins(event, data) {
    this.io.emit('admin_notification', { event, data });
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }
}
```

#### Connection Management

```javascript
// Track user connections
setupEventHandlers() {
  this.io.on('connection', (socket) => {
    const userId = socket.userId;

    // Add to connected users map
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId).push(socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
      this.removeUserConnection(userId, socket.id);
    });

    // Send pending notifications
    this.sendPendingNotifications(userId);
  });
}
```

### Notification Database Model

#### Notification Schema

```javascript
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'payment_success',
        'payment_failed',
        'worker_dispatched',
        'worker_arrived',
        'trial_reminder',
        'booking_confirmed',
        'system_alert',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    channels: [
      {
        type: String,
        enum: ['socket', 'email', 'sms', 'push'],
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true,
  }
);
```

#### Notification Model Methods

```javascript
// Mark notification as read
notificationSchema.methods.markAsRead = function () {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Check if notification is expired
notificationSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Get notification summary
notificationSchema.methods.getSummary = function () {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    priority: this.priority,
    read: this.read,
    createdAt: this.createdAt,
  };
};
```

### REST API Endpoints

#### Get User Notifications

```javascript
// GET /api/v1/notifications
// Query parameters: page, limit, read, type, priority
router.get('/', authMiddleware, async (req, res) => {
  const { page = 1, limit = 20, read, type, priority } = req.query;

  const filter = { recipient: req.user._id };

  if (read !== undefined) filter.read = read === 'true';
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('sender', 'fullName');

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({
    status: 'success',
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    },
  });
});
```

#### Mark Notification as Read

```javascript
// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      recipient: req.user._id,
    },
    {
      read: true,
      readAt: new Date(),
    },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      status: 'fail',
      message: 'Notification not found',
    });
  }

  // Emit real-time update
  socketService.sendToUser(req.user._id, 'notification_read', {
    notificationId: notification._id,
  });

  res.json({
    status: 'success',
    data: { notification },
  });
});
```

#### Mark All as Read

```javascript
// PATCH /api/v1/notifications/mark-all-read
router.patch('/mark-all-read', authMiddleware, async (req, res) => {
  const result = await Notification.updateMany(
    {
      recipient: req.user._id,
      read: false,
    },
    {
      read: true,
      readAt: new Date(),
    }
  );

  // Emit real-time update
  socketService.sendToUser(req.user._id, 'all_notifications_read', {
    count: result.modifiedCount,
  });

  res.json({
    status: 'success',
    message: `${result.modifiedCount} notifications marked as read`,
  });
});
```

#### Get Notification Statistics

```javascript
// GET /api/v1/notifications/stats
router.get('/stats', authMiddleware, async (req, res) => {
  const userId = req.user._id;

  const stats = await Notification.aggregate([
    { $match: { recipient: userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        unreadCount: {
          $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] },
        },
      },
    },
  ]);

  const totalUnread = await Notification.countDocuments({
    recipient: userId,
    read: false,
  });

  res.json({
    status: 'success',
    data: {
      totalUnread,
      byType: stats,
    },
  });
});
```

### Client-Side Integration

#### React/JavaScript Client

```javascript
// Notification hook for React
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(API_URL, {
      auth: { token: getAuthToken() },
    });

    // Listen for new notifications
    newSocket.on('notification', (data) => {
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast.info(data.title);
    });

    // Listen for notification read events
    newSocket.on('notification_read', (data) => {
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === data.notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    socket,
  };
};
```

#### Notification Component

```jsx
const NotificationDropdown = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-dropdown">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-trigger"
      >
        <BellIcon />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-list">
          {notifications.length === 0 ? (
            <div className="no-notifications">No notifications</div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? 'read' : 'unread'
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                }}
              >
                <div className="notification-header">
                  <span className="title">{notification.title}</span>
                  <span className="time">
                    {formatTimeAgo(notification.timestamp)}
                  </span>
                </div>
                <div className="notification-body">{notification.message}</div>
                {notification.actionUrl && (
                  <a href={notification.actionUrl} className="action-link">
                    View Details
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
```

### Performance Optimization

#### Connection Scaling

```javascript
// Redis adapter for multiple server instances
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');

const pubClient = createClient({ url: 'redis://localhost:6379' });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

#### Notification Batching

```javascript
// Batch notifications to reduce database calls
class NotificationBatcher {
  constructor() {
    this.batch = [];
    this.batchSize = 100;
    this.flushInterval = 5000; // 5 seconds

    setInterval(() => this.flush(), this.flushInterval);
  }

  add(notification) {
    this.batch.push(notification);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.batch.length === 0) return;

    const notifications = [...this.batch];
    this.batch = [];

    try {
      await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Failed to flush notification batch:', error);
      // Re-add failed notifications to batch
      this.batch.unshift(...notifications);
    }
  }
}
```

---

# Email Optimization

## Email Performance Optimization Summary

### Issues Fixed

#### 1. **Email Service Optimizations**

- **Connection Pooling**: Added `pool: true` to reuse SMTP connections
- **Reduced Timeouts**: Decreased connection timeouts from 60s to 10s
- **Keep-Alive**: Added `keepAlive: true` to maintain persistent connections
- **IPv4 Enforcement**: Added `family: 4` to avoid IPv6 DNS lookup delays
- **Max Connections**: Limited to 5 concurrent connections to avoid overwhelming Gmail
- **Error Handling**: Improved error handling with detailed error information

#### 2. **Async Email Sending**

- **Non-blocking**: Changed from `await emailService.sendResetEmail()` to `setImmediate()`
- **Immediate Response**: API now responds immediately without waiting for email to send
- **Background Processing**: Email sending happens in background after response is sent

#### 3. **Performance Monitoring**

- **Duration Tracking**: Added timing to measure email sending performance
- **Error Logging**: Comprehensive error logging for debugging
- **Connection Verification**: SMTP connection verified on startup

### Performance Improvements

#### Before Optimization:

- API response time: **5-15 seconds** (waiting for email to send)
- User experience: Poor (long wait times)
- Error visibility: Limited

#### After Optimization:

- API response time: **< 500ms** (immediate response)
- User experience: Excellent (instant feedback)
- Email delivery: **1-3 seconds** (in background)
- Error tracking: Comprehensive

### Configuration Recommendations

#### 1. **Gmail App Password**

Ensure you're using a Gmail App Password instead of regular password:

1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Use that password in `SMTP_PASS`

#### 2. **Environment Variables**

Current configuration looks correct:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=mostafa.dev.safwat@gmail.com
SMTP_PASS=ykmt tdmm eejh kaoo
```

#### 3. **Network Optimization**

- Ensure server has good internet connectivity
- Consider using a dedicated SMTP service like SendGrid or AWS SES for production
- Monitor Gmail's rate limits (500 emails/day for free accounts)

### Implementation Details

#### Modified Files:

1. `utils/emailService.js` - Optimized SMTP configuration
2. `controllers/auth/forgotPassword.js` - Async email sending
3. `services/emailQueue.js` - Email queue system (optional)

#### API Flow:

1. User requests password reset
2. Generate reset token and save to database
3. Return success response immediately
4. Send email in background using `setImmediate()`
5. Log success/failure without affecting user experience

### Testing

Run the test script to verify performance:

```bash
node test-email-performance.js
```

Expected results:

- Email sending: < 3 seconds
- No connection errors
- Proper error handling

### Production Considerations

1. **Rate Limiting**: Gmail has daily sending limits
2. **Monitoring**: Set up email delivery monitoring
3. **Fallback**: Consider backup SMTP providers
4. **Queue System**: Implement Redis-based queue for high volume
5. **Retry Logic**: Add exponential backoff for failed emails

### Troubleshooting

If emails are still slow:

1. Check network connectivity to Gmail servers
2. Verify App Password is correct and active
3. Check Gmail account for any security alerts
4. Consider switching to a dedicated email service
5. Monitor server DNS resolution speed

The main improvement is that users now get immediate feedback instead of waiting for the email to send!

---

# Todo List

## Development Priorities and Tasks

### High Priority

#### 🔥 Critical Issues

- [ ] Fix worker deployment status tracking
- [ ] Implement proper error handling for payment failures
- [ ] Add validation for overlapping worker bookings
- [ ] Optimize email sending performance
- [ ] Fix trial period calculation logic

#### 💰 Payment System

- [ ] Add refund processing workflow
- [ ] Implement payment retry logic for failed transactions
- [ ] Add support for partial refunds
- [ ] Create payment dispute resolution system
- [ ] Add payment method validation

#### 🔔 Notifications

- [ ] Implement push notifications for mobile
- [ ] Add SMS notification integration
- [ ] Create notification preference management
- [ ] Add notification templates system
- [ ] Implement notification scheduling

### Medium Priority

#### 👥 User Management

- [ ] Add user profile completion tracking
- [ ] Implement user verification system
- [ ] Add user activity logging
- [ ] Create user feedback system
- [ ] Add user preference management

#### 🏢 Company Features

- [ ] Add company performance analytics
- [ ] Implement company rating system
- [ ] Add company document management
- [ ] Create company worker management dashboard
- [ ] Add company billing system

#### 👷 Worker Management

- [ ] Add worker skill certification system
- [ ] Implement worker availability calendar
- [ ] Add worker performance tracking
- [ ] Create worker training modules
- [ ] Add worker background check integration

### Low Priority

#### 📊 Analytics & Reporting

- [ ] Create admin dashboard with key metrics
- [ ] Add payment analytics and reporting
- [ ] Implement user behavior tracking
- [ ] Add performance monitoring
- [ ] Create automated reporting system

#### 🔒 Security Enhancements

- [ ] Add two-factor authentication
- [ ] Implement API rate limiting per user
- [ ] Add suspicious activity detection
- [ ] Create security audit logging
- [ ] Add data encryption for sensitive fields

#### 🚀 Performance Optimization

- [ ] Implement Redis caching layer
- [ ] Add database query optimization
- [ ] Create API response caching
- [ ] Add image optimization and CDN
- [ ] Implement lazy loading for large datasets

### Technical Debt

#### 🛠️ Code Quality

- [ ] Add comprehensive unit tests
- [ ] Implement integration tests
- [ ] Add API documentation (Swagger)
- [ ] Refactor large controller functions
- [ ] Add code linting and formatting

#### 📝 Documentation

- [ ] Create API documentation
- [ ] Add code comments and JSDoc
- [ ] Create deployment guide
- [ ] Add troubleshooting documentation
- [ ] Create development setup guide

#### 🏗️ Architecture

- [ ] Implement proper error handling middleware
- [ ] Add request/response logging
- [ ] Create service layer abstraction
- [ ] Add proper validation schemas
- [ ] Implement dependency injection

### Future Enhancements

#### 📱 Mobile Features

- [ ] Add mobile app API endpoints
- [ ] Implement push notification service
- [ ] Add mobile-specific optimizations
- [ ] Create mobile authentication flow
- [ ] Add offline support for critical features

#### 🌍 Internationalization

- [ ] Add multi-language support
- [ ] Implement currency conversion
- [ ] Add region-specific features
- [ ] Create localized content management
- [ ] Add time zone handling

#### 🤖 Automation

- [ ] Add automated worker assignment
- [ ] Implement smart pricing algorithms
- [ ] Create automated reminder systems
- [ ] Add chatbot integration
- [ ] Implement automated reporting

### Bug Fixes

#### 🐛 Known Issues

- [ ] Fix duplicate email notifications
- [ ] Resolve socket connection timeout issues
- [ ] Fix payment status update race conditions
- [ ] Resolve timezone inconsistencies
- [ ] Fix file upload validation errors

#### 🔍 Testing Gaps

- [ ] Add payment processing tests
- [ ] Create notification system tests
- [ ] Add authentication flow tests
- [ ] Implement load testing
- [ ] Add security penetration testing

### DevOps & Infrastructure

#### 🚀 Deployment

- [ ] Set up CI/CD pipeline
- [ ] Add automated testing in pipeline
- [ ] Create staging environment
- [ ] Implement blue-green deployment
- [ ] Add environment-specific configurations

#### 📊 Monitoring

- [ ] Add application performance monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Create health check endpoints
- [ ] Add database monitoring
- [ ] Implement alerting system

#### 🔒 Security

- [ ] Add SSL certificate automation
- [ ] Implement security headers
- [ ] Add vulnerability scanning
- [ ] Create backup and recovery procedures
- [ ] Add compliance documentation

---

# Tests README

## Testing Infrastructure for Buty Plus Backend

### Overview

This directory contains the testing infrastructure for the Buty Plus backend API. Our testing strategy focuses on ensuring reliability, security, and performance of all critical system components.

### Testing Stack

#### Frameworks & Tools

- **Jest**: Primary testing framework
- **Supertest**: HTTP assertion testing
- **MongoDB Memory Server**: In-memory database for tests
- **Factory Pattern**: Test data generation
- **Coverage Reports**: Code coverage tracking

#### Test Types

1. **Unit Tests**: Individual function and method testing
2. **Integration Tests**: API endpoint testing
3. **Database Tests**: Model and query testing
4. **Security Tests**: Authentication and authorization testing
5. **Performance Tests**: Load and stress testing

### Project Structure

```
tests/
├── unit/                 # Unit tests
│   ├── models/          # Model tests
│   ├── services/        # Service layer tests
│   ├── utils/           # Utility function tests
│   └── controllers/     # Controller logic tests
├── integration/         # Integration tests
│   ├── auth/           # Authentication flow tests
│   ├── payments/       # Payment processing tests
│   ├── workers/        # Worker management tests
│   └── notifications/  # Notification system tests
├── security/           # Security-focused tests
├── performance/        # Load and performance tests
├── fixtures/           # Test data and fixtures
├── helpers/            # Test helper functions
└── setup/              # Test environment setup
```

### Running Tests

#### Full Test Suite

```bash
npm test
```

#### Test Categories

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Security tests
npm run test:security

# Performance tests
npm run test:performance

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

#### Specific Test Files

```bash
# Run specific test file
npm test -- tests/integration/auth/login.test.js

# Run tests matching pattern
npm test -- --testNamePattern="payment"

# Run tests for specific model
npm test -- tests/unit/models/userModel.test.js
```

### Test Configuration

#### Jest Configuration (jest.config.js)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/globalSetup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js', '<rootDir>/tests/**/*.spec.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'utils/**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### Test Database Setup

```javascript
// tests/setup/database.js
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer;

export const connectTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const disconnectTestDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const clearTestDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### Test Examples

#### Unit Test Example

```javascript
// tests/unit/models/userModel.test.js
import User from '../../../models/userModel.js';
import {
  connectTestDatabase,
  disconnectTestDatabase,
  clearTestDatabase,
} from '../../setup/database.js';

describe('User Model', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'plainPassword123',
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe('plainPassword123');
      expect(user.password).toMatch(/^\$2[ayb]\$\d+\$/);
    });

    it('should compare passwords correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'testPassword123',
      });
      await user.save();

      const isMatch = user.comparePassword('testPassword123');
      const isNotMatch = user.comparePassword('wrongPassword');

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Reset Token Generation', () => {
    it('should generate reset token correctly', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'testPassword123',
      });

      const token = user.generateResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpires).toBeDefined();
    });
  });
});
```

#### Integration Test Example

```javascript
// tests/integration/auth/login.test.js
import request from 'supertest';
import app from '../../../server.js';
import User from '../../../models/userModel.js';
import {
  connectTestDatabase,
  disconnectTestDatabase,
  clearTestDatabase,
} from '../../setup/database.js';

describe('POST /api/v1/auth/login', () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  it('should login with valid credentials', async () => {
    // Create test user
    const user = new User({
      email: 'test@example.com',
      password: 'testPassword123',
      fullName: 'Test User',
    });
    await user.save();

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testPassword123',
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Login successful');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongPassword',
      })
      .expect(401);

    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Invalid email or password');
  });

  it('should validate required fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        // Missing password
      })
      .expect(400);

    expect(response.body.status).toBe('fail');
    expect(response.body.errors).toBeDefined();
  });
});
```

#### Payment Integration Test

```javascript
// tests/integration/payments/paymentFlow.test.js
import request from 'supertest';
import app from '../../../server.js';
import {
  createTestUser,
  createTestWorker,
  createTestCompany,
} from '../../fixtures/testData.js';

describe('Payment Flow Integration', () => {
  let user, worker, company, authToken;

  beforeEach(async () => {
    await clearTestDatabase();

    user = await createTestUser();
    company = await createTestCompany();
    worker = await createTestWorker(company._id);

    // Get auth token
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: user.email,
      password: 'testPassword123',
    });

    authToken = loginResponse.headers['set-cookie'];
  });

  it('should create payment session for full payment', async () => {
    const paymentData = {
      workerId: worker._id,
      paymentType: 'full',
      userLocation: 'uae_inside',
    };

    const response = await request(app)
      .post('/api/v1/payments')
      .set('Cookie', authToken)
      .send(paymentData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.sessionUrl).toBeDefined();
    expect(response.body.data.payment.paymentType).toBe('full');
  });

  it('should create payment session for deposit payment', async () => {
    const paymentData = {
      workerId: worker._id,
      paymentType: 'deposit',
      userLocation: 'uae_inside',
    };

    const response = await request(app)
      .post('/api/v1/payments')
      .set('Cookie', authToken)
      .send(paymentData)
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.data.payment.paymentType).toBe('deposit');
    expect(response.body.data.payment.trialInfo.isTrialPayment).toBe(true);
  });
});
```

### Test Data Factory

#### Test Data Generation

```javascript
// tests/fixtures/testData.js
import User from '../../models/userModel.js';
import Company from '../../models/companyModel.js';
import Worker from '../../models/workerModel.js';
import Payment from '../../models/paymentModel.js';

export const createTestUser = async (overrides = {}) => {
  const userData = {
    email: 'test@example.com',
    password: 'testPassword123',
    fullName: 'Test User',
    role: 'customer',
    ...overrides,
  };

  const user = new User(userData);
  await user.save();
  return user;
};

export const createTestCompany = async (overrides = {}) => {
  const companyData = {
    companyName: 'Test Company',
    email: 'company@example.com',
    commercialLicenseNumber: 'CL123456',
    licensingAuthority: 'Dubai Municipality',
    headOfficeAddress: 'Dubai, UAE',
    status: 'approved',
    ...overrides,
  };

  const company = new Company(companyData);
  await company.save();
  return company;
};

export const createTestWorker = async (companyId, overrides = {}) => {
  const workerData = {
    fullName: 'Test Worker',
    company: companyId,
    skills: ['housekeeping', 'cooking'],
    experience: 3,
    nationality: 'Philippines',
    availability: 'available',
    ...overrides,
  };

  const worker = new Worker(workerData);
  await worker.save();
  return worker;
};

export const createTestPayment = async (
  userId,
  workerId,
  companyId,
  overrides = {}
) => {
  const paymentData = {
    user: userId,
    worker: workerId,
    company: companyId,
    pricing: {
      basePrice: 1200,
      serviceFee: 200,
      deliveryFee: 100,
      totalAmount: 1500,
      currency: 'AED',
    },
    paymentType: 'full',
    stripePaymentIntentId: 'pi_test_123',
    status: 'succeeded',
    ...overrides,
  };

  const payment = new Payment(paymentData);
  await payment.save();
  return payment;
};
```

### Security Testing

#### Authentication Tests

```javascript
// tests/security/authentication.test.js
describe('Authentication Security', () => {
  it('should prevent access without valid token', async () => {
    const response = await request(app).get('/api/v1/users/me').expect(401);

    expect(response.body.message).toMatch(/authentication/i);
  });

  it('should prevent access with expired token', async () => {
    const expiredToken = generateExpiredToken();

    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should prevent privilege escalation', async () => {
    const customerToken = await getCustomerToken();

    const response = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(403);
  });
});
```

### Performance Testing

#### Load Testing Example

```javascript
// tests/performance/loadTest.test.js
describe('API Performance', () => {
  it('should handle concurrent login requests', async () => {
    const concurrentRequests = 50;
    const requests = [];

    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(
        request(app).post('/api/v1/auth/login').send({
          email: 'test@example.com',
          password: 'testPassword123',
        })
      );
    }

    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const endTime = Date.now();

    const avgResponseTime = (endTime - startTime) / concurrentRequests;

    expect(avgResponseTime).toBeLessThan(1000); // Less than 1 second
    expect(responses.every((res) => res.status === 200)).toBe(true);
  });
});
```

### Coverage Reports

#### Generate Coverage

```bash
npm run test:coverage
```

#### Coverage Thresholds

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Continuous Integration

#### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v1
```

### Best Practices

#### Test Writing Guidelines

1. **Descriptive Names**: Use clear, descriptive test names
2. **Single Responsibility**: Each test should test one thing
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Clean Database**: Reset database state between tests
5. **Mock External Services**: Don't rely on external APIs in tests

#### Performance Considerations

1. **Parallel Testing**: Use Jest's parallel execution
2. **Test Database**: Use in-memory database for speed
3. **Selective Testing**: Run relevant tests during development
4. **CI Optimization**: Cache dependencies in CI pipeline

#### Security Testing

1. **Input Validation**: Test all input validation rules
2. **Authentication**: Test auth flows thoroughly
3. **Authorization**: Verify role-based access control
4. **Data Sanitization**: Test against injection attacks

---

This consolidated documentation provides Claude with comprehensive context about the Buty Plus project, including all major systems, features, optimizations, and technical details.
