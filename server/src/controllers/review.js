import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const createReview = async (req, res, next) => {
    try {
        const { vehicle_id, rating, comment } = req.body;

        if (!vehicle_id || !rating || !comment) {
            return next(new AppError('Missing required fields for review', 400));
        }

        const review = await prisma.review.create({
            data: {
                vehicle_id: parseInt(vehicle_id),
                user_id: req.user.id,
                rating: parseInt(rating),
                comment: comment
            },
            include: {
                user: { select: { id: true, name: true } }
            }
        });

        res.status(201).json({ status: 'success', data: { review } });
    } catch (error) {
        next(error);
    }
};
