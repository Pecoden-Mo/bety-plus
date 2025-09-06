# Buty Plus - Domestic Worker Booking Platform

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

### **User Management**

- Complete user profiles with contact information
- Address management (emirate, city, area, house/apartment numbers)
- Profile completion tracking
- ID/passport image upload
- Multiple phone number support (primary/secondary)

### **Company Management**

- Company registration and approval workflow
- Admin-controlled company status (pending/approved/rejected)
- Commercial license verification
- Company-worker relationship management

### **Worker Management**

- Comprehensive worker profiles (age, nationality, skills, experience)
- Location-based categorization (inside/outside UAE)
- Availability status tracking
- Skills categorization (cooking, cleaning, elderly care, childcare)
- Worker images and introductory videos
- Company-set pricing for individual workers

### **Advanced Payment System**

#### **UAE Inside vs Outside Logic**

- **Inside UAE Workers**:
  - 4-day trial period with deposit payment option
  - Full year booking available
  - Deposit + remaining payment flow
- **Outside UAE Workers**:
  - Full payment required upfront
  - No trial period available

#### **Payment Types**

- `deposit` - Trial payment for UAE workers (4 days) and this not optional
- `full` - Complete annual payment
- `remaining` - Balance payment after trial period

#### **Pricing Structure**

- Region-based pricing (UAE vs Outside_UAE)
- Service fees and delivery fees
- Experience-based multipliers
- Company-customizable worker pricing
- Multi-currency support (AED, USD, SAR, KWD, QAR)

### **Notification System**

- Real-time notifications via Socket.IO
- Company approval/rejection notifications
- Payment status updates
- Admin notification system

## 🗄️ Database Schema

### **Key Models**

#### **User Model**

```javascript
{
  email: String (required, unique),
  password: String (hashed),
  fullName: String,
  role: ['customer', 'admin', 'company'],
  primaryPhone: String,
  secondaryPhone: String,
  nationality: String,
  emirate: String,
  city: String,
  area: String,
  street: String,
  houseNumber: String,
  apartmentNumber: String,
  idPassportImage: String,
  stripeCustomerId: String
}
```

#### **Worker Model**

```javascript
{
  company: ObjectId (ref: Company),
  createdBy: ObjectId (ref: User),
  fullName: String,
  age: Number,
  nationality: String,
  maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'],
  skills: ['cooking', 'cleaning', 'elderly care', 'childcare', 'shopping'],
  location: String (UAE cities or international),
  isInside: Boolean, // UAE location flag
  yearsExperience: Number,
  language: [String],
  availability: ['currently available', 'reserved', 'waiting for update'],
  status: ['pending', 'approved', 'rejected'],
  price: Number, // Company-set pricing
  pictureWorker: String,
  introductoryVideo: String
}
```

#### **Payment Model**

```javascript
{
  user: ObjectId (ref: User),
  worker: ObjectId (ref: Worker),
  company: ObjectId (ref: Company),
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
  stripePaymentIntentId: String,
  status: ['pending', 'succeeded', 'failed', 'cancelled'],
  paymentMethod: {
    cardLast4: String,
    cardBrand: String
  }
}
```

#### **Company Model**

```javascript
{
  user: ObjectId (ref: User),
  companyName: String,
  commercialLicenseNumber: String,
  licensingAuthority: String,
  headOfficeAddress: String,
  status: ['pending', 'approved', 'rejected'],
  approvedBy: ObjectId (ref: User),
  approvalDate: Date
}
```

## 🔄 API Endpoints

### **Authentication Routes**

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset confirmation
- `POST /auth/change-password` - Change password (authenticated)

### **User Routes**

- `GET /users/me` - Get current user profile
- `PATCH /users/` - Update user profile
- `GET /users/profile` - Get detailed profile
- `GET /users/profile/completion` - Check profile completion status
- `DELETE /users/` - Delete user account

### **Company Routes**

- `POST /companies/auth/register` - Company registration
- `GET /companies/` - Get company profile
- `PATCH /companies/` - Update company
- `DELETE /companies/` - Delete company

### **Worker Routes (Company)**

- `POST /companies/workers` - Create worker
- `GET /companies/workers` - Get company workers
- `GET /companies/workers/:id` - Get specific worker
- `PATCH /companies/workers/:id` - Update worker
- `DELETE /companies/workers/:id` - Delete worker

### **Admin Routes**

- `GET /admins/companies/pending` - Get pending companies
- `GET /admins/companies` - Get all companies
- `POST /admins/companies/:id/approve` - Approve company
- `POST /admins/companies/:id/reject` - Reject company

### **Payment Routes**

- `GET /payments/quote/:workerId` - Get pricing quote
- `POST /payments/` - Create payment session
- `GET /payments/success` - Handle payment success
- `GET /payments/my-payments` - Get user payment history

### **Worker Routes (Public)**

- `GET /workers` - Get all approved workers
- `GET /workers/:id` - Get specific worker

## 💳 Payment Flow

### **Inside UAE Worker Booking**

1. Customer selects worker
2. System offers trial option (4 days) or full payment
3. If trial selected:
   - Customer pays deposit (4 days worth)
   - Worker becomes "reserved" for trial period
   - After trial, customer can complete full payment
4. If full payment selected:
   - Customer pays annual amount
   - Worker immediately reserved for full year

### **Outside UAE Worker Booking**

1. Customer selects worker
2. System requires full annual payment
3. Customer pays complete amount
4. Worker reserved for full year

### **Payment Processing**

1. Stripe Checkout Session created
2. Customer redirected to Stripe for payment
3. Payment webhook handles status updates
4. Worker availability updated based on payment success
5. Notifications sent to relevant parties

## 🔒 Security Features

- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Password Security**: bcrypt hashing with salt
- **Input Validation**: Express-validator on all endpoints
- **Rate Limiting**: Configurable request rate limiting
- **CORS**: Cross-origin request handling
- **File Upload**: Secure file upload with validation

## 🌐 Internationalization

- **Multi-language Support**: Arabic and English content
- **Multi-currency**: AED, USD, SAR, KWD, QAR
- **Regional Logic**: UAE-specific business rules
- **Localized Pricing**: Region-based pricing strategies

## 📊 Business Logic

### **Worker Approval Flow**

1. Company registers and awaits admin approval
2. Once approved, company can add workers
3. Workers start with "pending" status
4. Admin can approve/reject workers
5. Only approved workers available for booking

### **Pricing Calculation**

1. Base pricing determined by region (UAE/Outside_UAE)
2. Experience multipliers applied
3. Company can set custom pricing per worker
4. Service fees and delivery fees added
5. Currency conversion if needed

### **Trial Period Management**

1. Only available for UAE workers
2. 4-day trial period
3. Deposit calculation: (Annual Price / 365) \* 4
4. Trial expiry tracking
5. Automatic notifications for trial completion

## 🚀 Deployment & Infrastructure

- **Environment**: Production and development configurations
- **Process Management**: PM2 ecosystem configuration
- **Logging**: Structured logging with file rotation
- **Database**: MongoDB connection with retry logic
- **File Storage**: Express file upload with size limits

## 📈 Analytics & Monitoring

- **Payment Tracking**: Comprehensive payment status tracking
- **User Analytics**: Profile completion rates
- **Business Metrics**: Company approval rates, worker utilization
- **Error Tracking**: Global error handling with logging

## 🔧 Development & Testing

- **Code Quality**: ESLint and Prettier configuration
- **Validation**: Input validation on all endpoints
- **Error Handling**: Centralized error management
- **API Documentation**: Comprehensive endpoint documentation
- **Testing Infrastructure**: Jest testing framework setup

## 📝 Recent Enhancements

### **User Model Enhancement**

- Added comprehensive user profile fields
- Multiple phone number support
- Address standardization
- ID/passport image upload capability

### **Payment System Upgrade**

- UAE inside/outside payment logic
- Trial period implementation
- Multiple payment type support
- Enhanced payment tracking

### **Company Features**

- Worker-specific pricing
- Enhanced approval workflow
- Improved company management

## 🎯 Key Business Rules

1. **Companies must be approved** before adding workers
2. **UAE workers** can offer trial periods, outside workers cannot
3. **Trial deposits** are calculated as 4 days of annual pricing
4. **Payment completion** is required before worker reservation
5. **User profiles** must be complete for payment processing
6. **Role-based access** ensures proper data isolation
7. **Real-time notifications** keep all parties informed

This platform serves as a comprehensive solution for domestic worker booking with sophisticated payment handling, user management, and business logic tailored for the UAE market while supporting international operations.
