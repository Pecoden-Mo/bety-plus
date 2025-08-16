// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  approvalDate: {
    type: Date,
  },
});

module.exports = mongoose.model('Company', companySchema);

// models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['company_registration', 'company_approved', 'company_rejected'],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);

// services/notificationService.js
const Notification = require('../models/Notification');
const Company = require('../models/Company');

class NotificationService {
  // Create notification for new company registration
  static async createCompanyRegistrationNotification(companyId) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      const notification = new Notification({
        type: 'company_registration',
        title: 'New Company Registration',
        message: `New company "${company.name}" has registered and is pending approval.`,
        companyId: companyId,
      });

      await notification.save();

      // Emit real-time notification (if using Socket.IO)
      this.emitNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating company registration notification:', error);
      throw error;
    }
  }

  // Create notification for company approval/rejection
  static async createCompanyStatusNotification(companyId, status, adminId) {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        throw new Error('Company not found');
      }

      const notification = new Notification({
        type: status === 'approved' ? 'company_approved' : 'company_rejected',
        title: `Company ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Company "${company.name}" has been ${status}.`,
        companyId: companyId,
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating company status notification:', error);
      throw error;
    }
  }

  // Get all notifications
  static async getAllNotifications(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const notifications = await Notification.find()
        .populate('companyId', 'name email status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments();

      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount() {
    try {
      return await Notification.countDocuments({ isRead: false });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId) {
    try {
      return await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    try {
      return await Notification.updateMany({ isRead: false }, { isRead: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Emit real-time notification (requires Socket.IO setup)
  static emitNotification(notification) {
    // This assumes you have Socket.IO setup
    if (global.io) {
      global.io.emit('new_notification', notification);
    }
  }
}

module.exports = NotificationService;

// routes/companies.js
const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const NotificationService = require('../services/notificationService');

// Company registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, description } = req.body;

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this email already exists',
      });
    }

    // Create new company
    const company = new Company({
      name,
      email,
      phone,
      address,
      description,
    });

    await company.save();

    // Create notification for admin
    await NotificationService.createCompanyRegistrationNotification(
      company._id
    );

    res.status(201).json({
      success: true,
      message: 'Company registered successfully. Pending admin approval.',
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        status: company.status,
      },
    });
  } catch (error) {
    console.error('Error registering company:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get all companies (admin endpoint)
router.get('/all', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const companies = await Company.find(filter)
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Company.countDocuments(filter);

    res.json({
      success: true,
      companies,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Approve/Reject company (admin endpoint)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminId } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found',
      });
    }

    if (company.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Company has already been processed',
      });
    }

    // Update company status
    company.status = status;
    company.approvedBy = adminId;
    company.approvalDate = new Date();
    await company.save();

    // Create notification for status change
    await NotificationService.createCompanyStatusNotification(
      id,
      status,
      adminId
    );

    res.json({
      success: true,
      message: `Company ${status} successfully`,
      company,
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;

// routes/notifications.js
const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await NotificationService.getAllNotifications(
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get unread notifications count
router.get('/unread-count', async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount();
    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', async (req, res) => {
  try {
    await NotificationService.markAllAsRead();
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;

// app.js (main application file)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Make io globally available for notifications
global.io = io;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://localhost:27017/company_approval_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
const companyRoutes = require('./routes/companies');
const notificationRoutes = require('./routes/notifications');

app.use('/api/companies', companyRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO for real-time notifications
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Admin disconnected:', socket.id);
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Company Approval System API',
    version: '1.0.0',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
