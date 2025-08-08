import socialAuth from './socialAuthRoute.js';
import auth from './authRout.js';

import express from 'express';

const router = express.Router();

router.use('/auth', auth);
router.use('/social-auth', socialAuth);

export default router;
