import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db.js';
import { AppError } from '../middleware/errorHandler.js';

const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user.id, user.role);

    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token, // Keeping token in body for convenience if needed, though HttpOnly is better
        data: { user },
    });
};

export const signup = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return next(new AppError('Email already in use', 400));

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role === 'HOST' ? 'HOST' : 'USER'
            },
        });

        createSendToken(newUser, 201, res);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return next(new AppError('Please provide email and password', 400));

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return next(new AppError('Incorrect email or password', 401));
        }

        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};

export const getMe = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, name: true, role: true }
        });
        if (!user) return next(new AppError('User not found', 404));

        res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
        next(err);
    }
};

export const switchRole = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return next(new AppError('User not found', 404));

        const newRole = user.role === 'USER' ? 'HOST' : 'USER';

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { role: newRole }
        });

        createSendToken(updatedUser, 200, res);
    } catch (err) {
        next(err);
    }
};
