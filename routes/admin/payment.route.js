import express from 'express';
import adminController from '../../controllers/admin/index.js';

const router = express.Router();

// Get all payments with deployment info
router.get('/', adminController.getAllPaymentsWithDeployment);

// Get deployment statistics
router.get('/stats', adminController.getDeploymentStats);

// Get specific payment deployment details
router.get('/:paymentId', adminController.getPaymentDeploymentDetails);

// Update worker deployment status
router.patch(
  '/:paymentId/deployment',
  adminController.updateWorkerDeploymentStatus
);

export default router;
