import { Router } from 'express';
import { isAuthenticated } from '../../middleware/authMiddleware.js';
import paymentValidate from '../../utils/validators/paymentValidate.js';
import paymentCon from '../../controllers/payment/index.js';

const router = Router();

// All payment routes require authentication
router.use(isAuthenticated);

// Get pricing quote before payment
router.get('/quote/:workerId', paymentCon.getPricingQuote);

router.post('/', paymentValidate.create, paymentCon.create);
// Create checkout session (secure payment)

// Handle payment success
router.get('/success', paymentCon.success);

// Get user payments histor
router.get('/my-payments', paymentCon.getUserPayments);

export default router;
