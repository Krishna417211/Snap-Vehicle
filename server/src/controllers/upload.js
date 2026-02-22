import fs from 'fs';
import { AppError } from '../middleware/errorHandler.js';

export const uploadImage = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return next(new AppError('No image provided', 400));
        }

        const localUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);

        res.status(200).json({
            status: 'success',
            data: {
                urls: localUrls
            }
        });
    } catch (error) {
        if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
        next(new AppError('Failed to upload image', 500));
    }
};
