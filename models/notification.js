import mongoose from 'mongoose';
//
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel',
      required: true,
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ['User', 'Company', 'Worker'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'company_registration_pending',
        'company_approved',
        'company_rejected',
        'worker_added_pending',
        'worker_approved',
        'worker_rejected',
        'general_message',
      ],
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
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
