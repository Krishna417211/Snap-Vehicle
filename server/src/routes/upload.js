import express from 'express';
import { uploadImage } from '../controllers/upload.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', requireAuth, upload.array('images', 5), uploadImage);

export default router;
