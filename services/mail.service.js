import { sendEmail } from '../config/mailer.js';
import { logger } from '../utils/logger.js';

export const sendBookingConfirmation = async (email, bookingDetails) => {
    try {
        await sendEmail(
            email,
            'Booking Confirmation',
            `Your booking for ${bookingDetails.slot} is confirmed!`
        );
        logger.info(`Booking confirmation sent to ${email}`);
    } catch (err) {
        logger.error('Failed to send booking email:', err);
        throw err;
    }
};

export const sendPasswordReset = async (email, resetToken) => {
    try {
        await sendEmail(
            email,
            'Password Reset',
            `Use this token to reset your password: ${resetToken}`
        );
    } catch (err) {
        logger.error('Failed to send password reset email:', err);
        throw err;
    }
};
