import express from 'express';
import passport from 'passport';
import {
    getAllUsers,
    getAllBookings,
    updateBookingStatus,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Проверка прав администратора для всех маршрутов
router.use(
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        next();
    }
);

// Управление пользователями
router.get('/users', getAllUsers);

// Управление бронированиями
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

export default router;
