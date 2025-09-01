import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Map to store user socket connections
  }

  // Initialize Socket.IO server
  init(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Authentication middleware for Socket.IO
    this.io.use(async (socket, next) => {
      try {
        const { token } = socket.handshake.auth;

        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    // Handle connections
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);

      // Store user connection
      this.connectedUsers.set(socket.userId, socket);

      // Join user to their own room
      socket.join(socket.userId);

      // Join admins to admin room
      if (socket.userRole === 'admin') {
        socket.join('admins');
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle marking notification as read
      socket.on('mark_notification_read', (notificationId) => {
        // This could trigger database update
        socket.broadcast
          .to(socket.userId)
          .emit('notification_read', notificationId);
      });
    });

    return this.io;
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    if (this.io) {
      this.io.to(userId.toString()).emit(event, data);
    }
  }

  // Send notification to all admins
  sendToAdmins(event, data) {
    if (this.io) {
      this.io.to('admins').emit(event, data);
    }
  }

  // Send notification to multiple users
  sendToUsers(userIds, event, data) {
    if (this.io) {
      userIds.forEach((userId) => {
        this.io.to(userId.toString()).emit(event, data);
      });
    }
  }

  // Get connected user count
  getConnectedUserCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
  }
}

// Export singleton instance
export default new SocketService();
