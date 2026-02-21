import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return next(new AppError('You are not logged in', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return next(new AppError('Invalid or expired token', 401));
    }
};

export const requireRole = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
