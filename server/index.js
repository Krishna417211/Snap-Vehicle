import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './src/routes/auth.js';
import vehicleRoutes from './src/routes/vehicle.js';
import bookingRoutes from './src/routes/booking.js';
import reviewRoutes from './src/routes/review.js';
import uploadRoutes from './src/routes/upload.js';
import checkoutRoutes from './src/routes/checkout.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"]
    }
});

// Expose io to routes
app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected to live dashboard:', socket.id);

    socket.on('join_host_room', (hostId) => {
        socket.join(hostId.toString());
        console.log(`Host ${hostId} joined their alert room`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/checkout', checkoutRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Global Error Handler
app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Festival server running on http://localhost:${PORT}`);
});
