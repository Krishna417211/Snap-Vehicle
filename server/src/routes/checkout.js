import express from 'express';
import { createCheckoutSession, verifySession } from '../controllers/checkout.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-session', requireAuth, createCheckoutSession);
router.post('/verify', requireAuth, verifySession);

export default router;
