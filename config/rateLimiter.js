// rateLimiter.js
import { RateLimiterMemory } from 'rate-limiter-flexible';

const resetRequestLimiter = new RateLimiterMemory({
  keyGenerator: (req) => `reset_req_${req.ip}_${req.body.email}`,
  points: 5,
  duration: 3600 / 2, // 1 hour
  blockDuration: 3600 / 2,
});

const resetConfirmLimiter = new RateLimiterMemory({
  keyGenerator: (req) => `reset_confirm_${req.ip}`, // Fixed typo
  points: 10,
  duration: 900, // 15 minutes
  blockDuration: 900,
});

export default {
  resetRequestLimiter,
  resetConfirmLimiter,
};
