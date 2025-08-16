import passport from 'passport';
import express from 'express';
import auth from '../../controllers/user/auth/index.js';
import '../../configuration/passport.js';

const router = express.Router();

// auth with social media
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false,
  }),
  auth.social
);

// Microsoft OAuth routes
router.get(
  '/microsoft',
  passport.authenticate('microsoft', {
    session: false,
  })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', {
    failureRedirect: '/login',
    session: false,
  }),
  auth.social
);

export default router;
