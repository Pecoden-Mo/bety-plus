# Buty Plus - Domestic Worker Booking Platform

## Project Overview

Buty Plus is a comprehensive Node.js backend API for a domestic worker booking platform that connects customers with domestic workers (housemaids, babysitters, elderly care) through registered companies. The platform operates with sophisticated payment processing, real-time notifications, and admin management capabilities.

## 🛠️ Technology Stack

### Core Technologies

- **Runtime**: Node.js with Express.js (v5.1.0)
- **Database**: MongoDB with Mongoose ODM (v8.17.0)
- **Authentication**: JWT-based with role-based access control
- **Payment Processing**: Stripe integration (v18.4.0)
- **Real-time Communication**: Socket.IO (v4.8.1)
- **Email Service**: Nodemailer (v7.0.5)
- **Validation**: Express-validator (v7.2.1)
- **Security**: bcryptjs password hashing

### Development Tools

- **Code Quality**: ESLint + Prettier
- **Process Manager**: PM2 (ecosystem.config.cjs)
- **Environment**: dotenv configuration
- **CORS**: Cross-origin resource sharing enabled
- **Logging**: Morgan middleware
- **Rate Limiting**: rate-limiter-flexible

## 🏗️ Project Architecture

```
backend/
├── config/              # Configuration files
│   ├── dbConnection.js  # MongoDB connection
│   ├── passport.js      # Social auth strategies
│   └── rateLimiter.js   # Rate limiting configs
├── controllers/         # Request handlers
│   ├── admin/          # Admin operations
│   ├── auth/           # Authentication
│   ├── company/        # Company management
│   ├── payment/        # Payment processing
│   ├── pricing/        # Pricing management
│   ├── user/           # User operations
│   └── worker/         # Worker operations
├── middleware/         # Custom middleware
│   ├── authMiddleware.js      # JWT authentication
│   ├── expressValidator.js   # Input validation
│   ├── formDataMiddleware.js # File upload handling
│   └── globalError.js        # Error handling
├── models/             # Database schemas
│   ├── companyModel.js
│   ├── notification.js
│   ├── paymentModel.js
│   ├── pricingModel.js
│   ├── userModel.js
│   └── workerModel.js
├── routes/             # API route definitions
│   ├── admin/          # Admin routes
│   ├── auth/           # Auth routes
│   ├── company/        # Company routes
│   ├── notification/   # Notification routes
│   ├── payment/        # Payment routes
│   ├── pricing/        # Pricing routes
│   └── user/           # User routes
├── services/           # Business logic
│   ├── authService.js
│   ├── companyService.js
│   ├── emailQueue.js
│   ├── notificationService.js
│   ├── pricingService.js
│   ├── socketService.js
│   ├── stripeService.js
│   └── workerService.js
├── utils/              # Utilities and helpers
│   ├── appError.js
│   ├── catchAsync.js
│   ├── emailService.js
│   ├── notification.js
│   ├── sendToken.js
│   ├── helpers/
│   └── validators/
└── server.js           # Application entry point
```

## 👥 User System & Authentication

### User Types

1. **Customer** (`role: 'customer'`)
   - Books domestic workers
   - Makes payments
   - Manages profile

2. **Company** (`role: 'company'`)
   - Provides workers
   - Manages worker profiles
   - Receives bookings

3. **Admin** (`role: 'admin'`)
   - Platform management
   - Company approval
   - Payment oversight

### Authentication Features

- **JWT Token Authentication**: Secure token-based sessions
- **Social Authentication**: Google, Microsoft, Apple OAuth
- **Password Reset**: Email-based reset with tokens
- **Role-Based Access Control**: Route protection by user role
- **Rate Limiting**: Prevents brute force attacks

### User Model Features

```javascript
// Key user schema fields
{
  email: String (unique, required),
  password: String (hashed, required),
  role: ['customer', 'admin', 'company'],
  fullName: String,
  phoneNumber: [String],
  address: {
    city: String,
    area: String,
    street: String,
    houseNumber: String
  },
  provider: {
    name: String,  // For social auth
    providerId: String
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  stripeCustomerId: String
}
```

## 🏢 Company Management

### Company Registration

- Commercial license verification
- Admin approval process
- Company profile management
- Worker association

### Company Features

- **Worker Management**: Add, update, delete workers
- **Booking Management**: Receive and manage bookings
- **Profile Management**: Update company information
- **Status Tracking**: Pending, approved, rejected states

## 👷 Worker System

### Worker Management

- **Company Association**: Workers belong to companies
- **Skill Tracking**: Multiple skills per worker
- **Availability Status**: Available, reserved, unavailable
- **Approval System**: Admin approval required

### Worker Model

```javascript
{
  fullName: String,
  company: ObjectId (ref: 'Company'),
  skills: [String],
  experience: Number,
  nationality: String,
  religion: String,
  availability: ['available', 'reserved', 'unavailable'],
  status: ['pending', 'approved', 'rejected'],
  createdBy: ObjectId (ref: 'User')
}
```

## 💰 Payment System

### Payment Processing

- **Stripe Integration**: Secure payment processing
- **Multiple Payment Types**: Deposit, full, remaining payments
- **Trial System**: 4-day trial for UAE workers
- **Worker Deployment Tracking**: From payment to service start

### Payment Model Features

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
    trialStartDate: Date,
    trialEndDate: Date
  },
  workerDeployment: {
    status: ['pending_dispatch', 'dispatched', 'arrived'],
    dispatchDate: Date,
    actualArrivalDate: Date
  },
  status: ['pending', 'succeeded', 'failed', 'refunded'],
  stripePaymentIntentId: String,
  endDate: Date
}
```

### Payment Flow

1. **Payment Creation**: Stripe checkout session
2. **Payment Success**: Worker reservation
3. **Worker Dispatch**: Admin marks as dispatched
4. **Worker Arrival**: Admin confirms arrival
5. **Service Start**: Service period begins from arrival

## 🔔 Notification System

### Real-time Notifications

- **Socket.IO Integration**: Real-time messaging
- **User Authentication**: JWT-based socket auth
- **Event Broadcasting**: User-specific and admin notifications
- **Persistent Storage**: Database-backed notifications

### Notification Features

```javascript
{
  recipient: ObjectId,
  sender: ObjectId,
  type: String,
  title: String,
  message: String,
  data: Mixed,
  priority: ['low', 'medium', 'high', 'urgent'],
  read: Boolean,
  readAt: Date,
  expiresAt: Date
}
```

### Socket Service

- **Connection Management**: User connection tracking
- **Event Handling**: Custom event broadcasting
- **Admin Notifications**: Bulk admin messaging
- **User Status**: Online/offline tracking

## 📧 Email System

### Email Service Features

- **SMTP Configuration**: Gmail integration
- **Performance Optimized**: Connection pooling, reduced timeouts
- **Async Processing**: Background email sending
- **Error Handling**: Comprehensive error tracking

### Email Types

- Password reset emails
- Payment confirmations
- Worker dispatch notifications
- Trial period reminders

## 🔄 API Endpoints

### Authentication Routes (`/api/v1/auth`)

```
POST /login           # User login
POST /forgot-password # Password reset request
POST /reset-password  # Password reset confirmation
POST /change-password # Change password
POST /logout          # User logout
```

### User Routes (`/api/v1/users`)

```
POST /auth/register          # User registration
GET  /auth/social/google     # Google OAuth
GET  /auth/social/microsoft  # Microsoft OAuth
GET  /me                     # Get current user
PATCH /                      # Update user profile
DELETE /                     # Delete user account
GET  /profile                # Get profile details
GET  /profile/completion     # Profile completion status
```

### Company Routes (`/api/v1/companies`)

```
POST /register        # Company registration
GET  /me             # Get company profile
PATCH /              # Update company
DELETE /             # Delete company
GET  /workers        # Get company workers
POST /workers        # Add new worker
GET  /workers/:id    # Get specific worker
PATCH /workers/:id   # Update worker
DELETE /workers/:id  # Delete worker
```

### Worker Routes (`/api/v1/workers`) - Public

```
GET  /        # Get all approved workers
GET  /:id     # Get specific worker
```

### Payment Routes (`/api/v1/payments`)

```
POST /                    # Create payment
GET  /                    # Get user payments
GET  /success            # Payment success handler
GET  /pricing-quote      # Get pricing quote
GET  /remaining-payment  # Get remaining payment info
```

### Admin Routes (`/api/v1/admins`)

```
POST /dashboard/add-admin           # Create admin
GET  /dashboard/companies          # Get all companies
GET  /dashboard/companies/pending  # Get pending companies
POST /dashboard/companies/:id/approve # Approve company
POST /dashboard/companies/:id/reject  # Reject company
GET  /payments                     # Get all payments
GET  /payments/stats              # Payment statistics
GET  /payments/:id                # Get payment details
PATCH /payments/:id/deployment    # Update deployment status
```

### Pricing Routes (`/api/v1/pricing`)

```
GET  /               # Get all pricing
POST /               # Create pricing
GET  /:id            # Get specific pricing
PATCH /:id           # Update pricing
DELETE /:id          # Delete pricing
GET  /region/:region # Get pricing by region
GET  /stats          # Pricing statistics
```

### Notification Routes (`/api/v1/notifications`)

```
GET  /               # Get user notifications
PATCH /:id/read      # Mark as read
PATCH /mark-all-read # Mark all as read
GET  /stats          # Notification statistics
```

## 🔐 Security Features

### Authentication Security

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **CORS Configuration**: Cross-origin protection

### Input Validation

- **Express Validator**: Server-side validation
- **Custom Validators**: Business logic validation
- **Error Handling**: Structured error responses
- **Data Sanitization**: Input cleaning

### API Security

- **Role-Based Access**: Route protection by user role
- **Token Verification**: JWT middleware on protected routes
- **Error Masking**: Production error hiding
- **Request Logging**: Morgan middleware logging

## 🌐 Environment Configuration

### Required Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3020
FRONTEND_URL="bety-plus-frontend.app"

# Database
MONGO_URI=mongodb+srv://...
MONGO_URI_DEV=mongodb+srv://...
MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/bety-plus

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
JWT_COOKIE_EXPIRES_IN=1d

# Social Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CLIENT_URL=http://localhost:3000

# Other
CONTACT_US=wa.me/201000000000
CORS_ORIGINS=http://localhost:3000,http://localhost:3020
```

## 📊 Database Models

### User Model

- Email, password, role-based authentication
- Profile information (name, phone, address)
- Social provider integration
- Password reset functionality
- Stripe customer ID

### Company Model

- Company registration and approval
- Commercial license tracking
- Contact information and address
- Worker associations
- Status management

### Worker Model

- Personal information and skills
- Company association
- Availability and status tracking
- Admin approval system
- Experience and qualifications

### Payment Model

- Stripe payment integration
- Trial and deployment tracking
- Pricing breakdown
- Service period management
- Related payment linking

### Pricing Model

- Service fees and delivery charges
- Trial period configuration
- Currency settings
- Regional pricing support

### Notification Model

- Real-time messaging
- Priority levels
- Read status tracking
- Expiration management
- User targeting

## 🚀 Deployment & Operations

### Process Management

- **PM2 Configuration**: ecosystem.config.cjs
- **Environment Handling**: Development and production configs
- **Database Connection**: Retry logic and timeout handling
- **Socket Management**: Real-time connection handling

### Development Scripts

```json
{
  "dev": "nodemon server.js",
  "prod": "NODE_ENV=production node server.js"
}
```

### Server Configuration

- **Port**: 3020 (configurable)
- **CORS**: Wildcard origin for development
- **Body Parsing**: JSON and URL-encoded
- **Cookie Support**: Cookie parser middleware
- **Static Files**: Express static file serving

## 🧪 Testing & Quality

### Code Quality Tools

- **ESLint**: Code linting with Airbnb config
- **Prettier**: Code formatting
- **Development Dependencies**: Comprehensive dev tooling

### Error Handling

- **Global Error Handler**: Centralized error management
- **Custom Error Class**: AppError for operational errors
- **Async Wrapper**: catchAsync utility for error handling
- **Environment-Specific**: Development vs production error responses

## 📈 Performance Optimizations

### Database Optimizations

- **Indexes**: Strategic indexing on key fields
- **Connection Pooling**: MongoDB connection management
- **Query Optimization**: Efficient data retrieval

### Email Performance

- **Connection Pooling**: SMTP connection reuse
- **Async Processing**: Background email sending
- **Timeout Optimization**: Reduced connection timeouts
- **IPv4 Enforcement**: Faster DNS resolution

### API Performance

- **Response Caching**: Where appropriate
- **Pagination**: Efficient data loading
- **Rate Limiting**: Prevent abuse
- **Compression**: Response compression middleware

## 🔄 Real-time Features

### Socket.IO Integration

- **User Authentication**: JWT-based socket auth
- **Connection Management**: User session tracking
- **Event Broadcasting**: Real-time notifications
- **Admin Communication**: Bulk messaging capabilities

### Notification System

- **Instant Delivery**: Real-time notification delivery
- **Persistent Storage**: Database-backed messages
- **Read Tracking**: Message read status
- **Priority Handling**: Urgent message priority

## 🎯 Business Logic

### Payment Processing

1. **Pricing Calculation**: Dynamic pricing based on services
2. **Stripe Integration**: Secure payment processing
3. **Trial Management**: 4-day trial period handling
4. **Worker Deployment**: Service period tracking
5. **Refund Processing**: Payment reversal handling

### Worker Management

1. **Company Association**: Workers linked to companies
2. **Approval Workflow**: Admin approval required
3. **Availability Tracking**: Real-time availability status
4. **Skill Management**: Multi-skill tracking
5. **Performance Monitoring**: Service quality tracking

### User Experience

1. **Profile Completion**: Guided profile setup
2. **Social Authentication**: Multiple login options
3. **Real-time Updates**: Live status notifications
4. **Payment Transparency**: Clear pricing breakdown
5. **Service Tracking**: End-to-end service monitoring

This documentation represents the current state of the Buty Plus backend API as implemented in the codebase.
