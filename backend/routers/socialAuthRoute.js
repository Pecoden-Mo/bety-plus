import express from 'express';
import socialAuth from '../controllers.js/auth/user/socialAuth.js';
import '../configuration/passport.js';
import passport from 'passport';

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
  socialAuth.authGoogleCallback
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
  socialAuth.authMicrosoftCallback
);

export default router;
