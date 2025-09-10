import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import NotificationService from '../../services/notificationService.js';

// Get all payments with worker deployment info for admin
export const getAllPaymentsWithDeployment = catchAsync(
  async (req, res, next) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) {
      filter['workerDeployment.status'] = status;
    }
    console.log(filter);

    const payments = await PaymentModel.find(filter)
      .populate('user', 'fullName email phone')
      .populate('worker', 'fullName phone skills location')
      .populate('company', 'companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PaymentModel.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        payments,
      },
    });
  }
);

// Update worker deployment status
export const updateWorkerDeploymentStatus = catchAsync(
  async (req, res, next) => {
    const { paymentId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending_dispatch', 'dispatched', 'arrived'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid deployment status', 400));
    }

    const payment = await PaymentModel.findById(paymentId)
      .populate('user', 'fullName email phone')
      .populate('worker', 'fullName phone')
      .populate('company', 'companyName');

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    // Update deployment status
    const previousStatus = payment.workerDeployment.status;
    payment.workerDeployment.status = status;

    // Add timestamps for different statuses
    const now = new Date();
    switch (status) {
      case 'dispatched':
        payment.workerDeployment.dispatchDate = now;
        break;
      case 'arrived':
        payment.workerDeployment.actualArrivalDate = now;
        break;
      default:
        break;
    }

    await payment.save();

    // Send notifications based on status change
    try {
      if (status === 'dispatched') {
        await NotificationService.notifyWorkerDispatched(payment, payment.user);
      } else if (status === 'arrived') {
        await NotificationService.notifyWorkerArrived(payment, payment.user);
      }
    } catch (notificationError) {
      // eslint-disable-next-line no-console
      console.error(
        'Failed to send deployment notifications:',
        notificationError
      );
    }

    res.status(200).json({
      status: 'success',
      message: `Worker deployment status updated from ${previousStatus} to ${status}`,
      data: {
        payment: {
          _id: payment._id,
          workerDeployment: payment.workerDeployment,
          trialInfo: payment.trialInfo,
          endDate: payment.endDate,
        },
      },
    });
  }
);

// Get specific payment deployment details
export const getPaymentDeploymentDetails = catchAsync(
  async (req, res, next) => {
    const { paymentId } = req.params;

    const payment = await PaymentModel.findById(paymentId)
      .populate('user', 'fullName email phone address')
      .populate('worker', 'fullName phone skills location')
      .populate('company', 'companyName phone address');

    if (!payment) {
      return next(new AppError('Payment not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment,
      },
    });
  }
);

// Get dashboard stats for worker deployments
export const getDeploymentStats = catchAsync(async (req, res, next) => {
  const stats = await PaymentModel.aggregate([
    {
      $match: {
        status: 'succeeded',
      },
    },
    {
      $group: {
        _id: '$workerDeployment.status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$pricing.totalAmount' },
      },
    },
  ]);

  // Get recent arrivals (last 7 days)
  const recentArrivals = await PaymentModel.find({
    'workerDeployment.status': 'arrived',
    'workerDeployment.actualArrivalDate': {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  }).countDocuments();

  // Get overdue dispatches (dispatched more than 2 days ago but not arrived)
  const overdueDispatches = await PaymentModel.find({
    'workerDeployment.status': 'dispatched',
    'workerDeployment.dispatchDate': {
      $lte: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  }).countDocuments();

  res.status(200).json({
    status: 'success',
    data: {
      deploymentStats: stats,
      recentArrivals,
      overdueDispatches,
    },
  });
});
