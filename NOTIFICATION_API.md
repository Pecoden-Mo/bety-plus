# Notification System API Documentation

## Overview

This notification system automatically sends notifications for key events:

- Company registration (notifies all admins)
- Company approval/rejection (notifies company owner)

## Features

- ✅ Real-time notifications via Socket.IO
- ✅ Bulk processing for performance
- ✅ Role-based filtering
- ✅ Read/unread tracking
- ✅ Pagination support
- ✅ Priority levels
- ✅ Async background processing

## API Endpoints

### Notification Endpoints

#### Get User Notifications

```
GET /api/v1/notifications
Query Parameters:
- page (optional): Page number (default: 1)
- limit (optional): Items per page (default: 10)
- unreadOnly (optional): Filter unread only (default: false)
```

#### Get Unread Count

```
GET /api/v1/notifications/unread-count
Response: { "status": "success", "data": { "count": 5 } }
```

#### Mark Notification as Read

```
PATCH /api/v1/notifications/:id/read
```

#### Mark All Notifications as Read

```
PATCH /api/v1/notifications/mark-all-read
```

#### Delete Notification

```
DELETE /api/v1/notifications/:id
```

### Admin Company Management

#### Get All Companies

```
GET /api/v1/admin/companies
Query Parameters:
- page (optional): Page number
- limit (optional): Items per page
- status (optional): Filter by status (pending, approved, rejected)
```

#### Get Pending Companies

```
GET /api/v1/admin/companies/pending
```

#### Approve Company

```
PATCH /api/v1/admin/companies/:id/approve
```

#### Reject Company

```
PATCH /api/v1/admin/companies/:id/reject
```

## Socket.IO Events

### Client-side Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token',
  },
});

// Listen for new notifications
socket.on('new_notification', (data) => {
  console.log('New notification:', data);
  // Update UI to show notification
});

// Mark notification as read
socket.emit('mark_notification_read', notificationId);
```

### Events

#### new_notification

Sent when a new notification is created for the user.

```javascript
{
  notification: {...}, // Full notification object
  message: "Your company has been approved",
  event: "company_approved",
  priority: "high"
}
```

#### notification_read

Broadcasted when a notification is marked as read.

## Database Schema

### Notification Model

```javascript
{
  recipient: ObjectId, // User who receives the notification
  message: String,     // Notification message
  event: String,       // Event type (company_registration, company_approved, etc.)
  company: ObjectId,   // Related company (optional)
  worker: ObjectId,    // Related worker (optional)
  reservation: ObjectId, // Related reservation (optional)
  priority: String,    // low, normal, high
  read: Boolean,       // Read status
  createdAt: Date      // Creation timestamp
}
```

## Authentication

All endpoints require JWT authentication via cookies or Authorization header.

## Error Handling

The API follows standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Usage Examples

### Company Registration Flow

1. User registers a company
2. System automatically notifies all admins
3. Admin receives real-time notification
4. Admin can approve/reject via API
5. Company owner receives approval/rejection notification

### Frontend Integration

```javascript
// Get notifications
const response = await fetch('/api/v1/notifications?page=1&limit=10');
const { data } = await response.json();

// Mark as read
await fetch(`/api/v1/notifications/${notificationId}/read`, {
  method: 'PATCH',
});

// Get unread count
const countResponse = await fetch('/api/v1/notifications/unread-count');
const {
  data: { count },
} = await countResponse.json();
```
