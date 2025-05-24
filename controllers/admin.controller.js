import User from '../models/User.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/apiError.js';

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении пользователей'));
    }
};

export const getAllBookings = async (req, res, next) => {
    try {
        const { locationId, dateFrom, dateTo } = req.query;
        const filter = {};

        if (locationId) filter.locationId = locationId;
        if (dateFrom || dateTo) {
            filter.slot = {};
            if (dateFrom) filter.slot.$gte = new Date(dateFrom);
            if (dateTo) filter.slot.$lte = new Date(dateTo);
        }

        const bookings = await Booking.find(filter)
            .populate('userId', 'name email')
            .populate('locationId', 'name address');

        res.json(bookings);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении бронирований'));
    }
};

export const updateBookingStatus = async (req, res, next) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        ).populate('locationId', 'name');

        if (!booking) {
            return next(new ApiError(404, 'Бронь не найдена'));
        }

        res.json(booking);
    } catch (err) {
        next(new ApiError(400, 'Некорректные данные для обновления'));
    }
};
