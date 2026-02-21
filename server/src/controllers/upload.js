import fs from 'fs';
import { AppError } from '../middleware/errorHandler.js';

export const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError('No image provided', 400));
        }

        // Return the local static file path instead of uploading to Cloudinary
        const localUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        res.status(200).json({
            status: 'success',
            data: {
                url: localUrl
            }
        });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        next(new AppError('Failed to upload image', 500));
    }
};
