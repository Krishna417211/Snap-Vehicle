import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

export const createVehicle = async (req, res, next) => {
    try {
        const { make, model, year, price_per_day, location_lat, location_lng, images, description } = req.body;

        if (!make || !model || !price_per_day) {
            return next(new AppError('Missing required fields', 400));
        }

        const newVehicle = await prisma.vehicle.create({
            data: {
                make,
                model,
                year: parseInt(year) || 2020,
                price_per_day: parseFloat(price_per_day),
                location_lat: parseFloat(location_lat) || 0,
                location_lng: parseFloat(location_lng) || 0,
                images: JSON.stringify(images || []),
                description: description || '',
                owner_id: req.user.id
            }
        });

        res.status(201).json({ status: 'success', data: { vehicle: newVehicle } });
    } catch (error) {
        next(error);
    }
};

export const getAllVehicles = async (req, res, next) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            include: { owner: { select: { id: true, name: true } } }
        });
        res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
    } catch (error) {
        next(error);
    }
};

export const getVehicle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(id) },
            include: {
                owner: { select: { id: true, name: true, email: true } },
                reviews: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!vehicle) return next(new AppError('No vehicle found with that ID', 404));

        res.status(200).json({ status: 'success', data: { vehicle } });
    } catch (error) {
        next(error);
    }
};

export const getHostVehicles = async (req, res, next) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            where: { owner_id: req.user.id }
        });

        res.status(200).json({ status: 'success', data: { vehicles } });
    } catch (error) {
        next(error);
    }
};
