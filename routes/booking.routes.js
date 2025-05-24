import express from 'express';
import {
    createBooking,
    getUserBookings,
    cancelBooking,
    getAvailableSlots,
    getUserBookingStats,
} from '../controllers/booking.controller.js';
import { validateBooking } from '../middleware/validation.js';
import passport from 'passport';

const router = express.Router();

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    validateBooking,
    createBooking
);

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    getUserBookings
);

router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    cancelBooking
);

router.get(
    '/locations/:locationId/slots',
    passport.authenticate('jwt', { session: false }),
    getAvailableSlots
);

router.get(
    '/stats',
    passport.authenticate('jwt', { session: false }),
    getUserBookingStats
);
export default router;
