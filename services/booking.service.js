import Booking from '../models/Booking.js';
import { sendBookingConfirmation } from './mail.service.js';
import ApiError from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const createBookingRecord = async (userId, slot, locationId) => {
    try {
        const booking = new Booking({ userId, slot, locationId });
        await booking.save();
        return booking;
    } catch (err) {
        logger.error('Failed to create booking:', err);
        throw new ApiError(400, 'Invalid booking data');
    }
};

export const checkSlotAvailability = async (slot, locationId) => {
    try {
        const existingBooking = await Booking.findOne({ slot, locationId });
        return !existingBooking;
    } catch (err) {
        logger.error('Failed to check slot availability:', err);
        throw err;
    }
};
