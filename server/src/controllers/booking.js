import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const createBooking = async (req, res, next) => {
    try {
        const { vehicle_id, start_date, end_date } = req.body;

        // Convert string dates to Date objects
        const start = new Date(start_date);
        const end = new Date(end_date);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return next(new AppError('Invalid dates provided', 400));
        }

        if (start >= end) {
            return next(new AppError('End date must be after start date', 400));
        }

        const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(vehicle_id) } });
        if (!vehicle) return next(new AppError('Vehicle not found', 404));

        // Overlap Validation
        const overlappingBookings = await prisma.booking.findMany({
            where: {
                vehicle_id: parseInt(vehicle_id),
                status: 'CONFIRMED',
                start_date: {
                    lte: end,
                },
                end_date: {
                    gte: start,
                },
            },
        });

        if (overlappingBookings.length > 0) {
            return next(new AppError('VEHICLE UNAVAILABLE FOR THESE DATES.', 400));
        }

        // Calculate days and total price
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const total_price = diffDays * vehicle.price_per_day;

        const newBooking = await prisma.booking.create({
            data: {
                user_id: req.user.id,
                vehicle_id: vehicle.id,
                start_date: start,
                end_date: end,
                total_price,
                status: 'PENDING'
            }
        });

        res.status(201).json({ status: 'success', data: { booking: newBooking } });
    } catch (error) {
        next(error);
    }
};

export const getMyBookings = async (req, res, next) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { user_id: req.user.id },
            include: {
                vehicle: {
                    select: { make: true, model: true, year: true, images: true, id: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ status: 'success', data: { bookings } });
    } catch (error) {
        next(error);
    }
};
