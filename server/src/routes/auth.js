import express from 'express';
import { signup, login, logout, getMe, switchRole } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', requireAuth, getMe);
router.post('/switch-role', requireAuth, switchRole);

export default router;
