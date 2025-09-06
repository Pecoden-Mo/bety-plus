import { Router } from 'express';
import { isAuthenticated } from '../../middleware/authMiddleware.js';
import paymentValidate from '../../utils/validators/paymentValidate.js';
import paymentCon from '../../controllers/payment/index.js';

const router = Router();

// All payment routes require authentication
router.use(isAuthenticated);

// Get pricing quote before payment (includes payment options for UAE/Outside UAE)
router.get('/quote/:workerId', paymentCon.getPricingQuote);

// Create payment session (supports deposit, full, remaining payment types)
router.post('/', paymentValidate.create, paymentCon.create);

// Get remaining payment details after trial
router.get(
  '/remaining/:depositPaymentId',
  paymentValidate.remainingPayment,
  paymentCon.getRemainingPayment
);

// Handle payment success
router.get('/success', paymentCon.success);

// Get user payments history
router.get('/my-payments', paymentCon.getUserPayments);

export default router;
