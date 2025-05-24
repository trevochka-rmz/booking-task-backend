import { body, validationResult } from 'express-validator';
import ApiError from '../utils/apiError.js';

export const validateRegistration = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export const validateBooking = [
    body('slot').isISO8601(),
    body('locationId').isMongoId(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(
                new ApiError(400, 'Invalid booking data', errors.array())
            );
        }
        next();
    },
];
