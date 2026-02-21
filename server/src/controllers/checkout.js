import Stripe from 'stripe';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res, next) => {
    try {
        const { booking_id } = req.body;

        const booking = await prisma.booking.findUnique({
            where: { id: parseInt(booking_id) },
            include: { vehicle: true }
        });

        if (!booking) return next(new AppError('Booking not found', 404));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user.email,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${booking.vehicle.make} ${booking.vehicle.model} Event`,
                            description: `Rental from ${booking.start_date.toISOString().split('T')[0]} to ${booking.end_date.toISOString().split('T')[0]}`,
                        },
                        unit_amount: Math.round(booking.total_price * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
            cancel_url: `http://localhost:5173/vehicle/${booking.vehicle_id}`,
        });

        res.status(200).json({
            status: 'success',
            data: { sessionUrl: session.url }
        });

    } catch (error) {
        next(error);
    }
};

export const verifySession = async (req, res, next) => {
    try {
        const { session_id, booking_id } = req.body;

        // Let's pretend we verify the stripe session was paid
        // In reality, we'd use stripe.checkout.sessions.retrieve(session_id)
        if (session_id) {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session.payment_status === 'paid') {
                const updatedBooking = await prisma.booking.update({
                    where: { id: parseInt(booking_id) },
                    data: { status: 'CONFIRMED' },
                    include: { vehicle: { select: { owner_id: true, make: true } } }
                });

                // Socket.io emitting
                const io = req.app.get('io');
                if (io) {
                    io.to(updatedBooking.vehicle.owner_id.toString()).emit('new_mission', {
                        message: `New mission confirmed for your ${updatedBooking.vehicle.make}!`,
                        booking: updatedBooking
                    });
                }

                return res.status(200).json({ status: 'success', data: { booking: updatedBooking } });
            }
        }

        return next(new AppError('Payment not verified', 400));
    } catch (error) {
        next(error);
    }
};
