Notification System Summary

## ignore workers and Reservation

Problem
Auto-send notifications to relevant parties when specific events occur in a company-worker-customer application.

Events & Recipients
EventRecipientsNotificationCompany RegistrationAll Admins"New company registered, needs approval"Admin Approves CompanyCompany Owner"Your company has been approved"Worker OnboardingAll Admins"New worker added, needs approval"Admin Approves WorkerCompany Owner"Your worker has been approved"Worker ReservationAdmins + Company Owner"New booking made"

Architecture
Models:

User (customers, admins, company owners)
Company (belongs to user)
Worker (independent profile, belongs to company)
Reservation (customer books worker)
Notification (stores all notifications)

Key Features

Real-time notifications (Socket.io ready)
Bulk processing for performance
Role-based filtering
Read/unread tracking
Pagination support
Priority levels
Async background processing
