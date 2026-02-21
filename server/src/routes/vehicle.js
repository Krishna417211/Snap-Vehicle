import express from 'express';
import { createVehicle, getAllVehicles, getVehicle, getHostVehicles } from '../controllers/vehicle.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllVehicles);
router.get('/host', requireAuth, requireRole('HOST'), getHostVehicles);
router.get('/:id', getVehicle);

router.post('/', requireAuth, requireRole('HOST'), createVehicle);

export default router;
