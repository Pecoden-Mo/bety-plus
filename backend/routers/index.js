import userRout from './userRout.js';
import express from 'express';

const router = express.Router();
router.use('/users', userRout);

export default router;
