import { RateLimiterMongo } from 'rate-limiter-flexible';
import mongoose from 'mongoose';

const resetRequestLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyGenerator: (req) => `reset_req_${req.ip}_${req.body.email}`,
  points: 3,
  duration: 3600, // Per 1 hour
  blockDuration: 3600, // Block for 1 hour
});
const resetConfirmLimiter = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyGenerator: (req) => `reset_confirm_${req.ip}}`,
  points: 5,
  duration: 3600 / 4,
  blockDuration: 3600 / 4,
});

export default {
  resetRequestLimiter,
  resetConfirmLimiter,
};
