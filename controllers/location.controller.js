import Location from '../models/Location.js';
import ApiError from '../utils/apiError.js';
import Booking from '../models/Booking.js';

export const getLocations = async (req, res, next) => {
    try {
        const locations = await Location.find({ isActive: true });
        res.json(locations);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении локаций'));
    }
};

export const getLocationById = async (req, res, next) => {
    try {
        const location = await Location.findById(req.params.id);
        if (!location) {
            return next(new ApiError(404, 'Локация не найдена'));
        }
        res.json(location);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении локации'));
    }
};

export const createLocation = async (req, res, next) => {
    try {
        const { name, address, description, price, capacity, franchiseEmail } =
            req.body;

        const location = new Location({
            name,
            address,
            description,
            price,
            capacity,
            franchiseEmail,
            workingHours: req.body.workingHours || [],
        });

        await location.save();
        res.status(201).json(location);
    } catch (err) {
        next(new ApiError(400, 'Некорректные данные локации'));
    }
};

export const updateLocation = async (req, res, next) => {
    try {
        const location = await Location.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!location) {
            return next(new ApiError(404, 'Локация не найдена'));
        }
        res.json(location);
    } catch (err) {
        next(new ApiError(400, 'Некорректные данные для обновления'));
    }
};

export const getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        const { locationId } = req.params;

        // Валидация входных параметров
        if (!date || !locationId) {
            return next(new ApiError(400, 'Не указана дата или ID локации'));
        }

        // Проверка формата даты (должна быть в формате YYYY-MM-DD)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return next(
                new ApiError(
                    400,
                    'Некорректный формат даты. Используйте YYYY-MM-DD'
                )
            );
        }

        const location = await Location.findById(locationId);
        if (!location) {
            return next(new ApiError(404, 'Локация не найдена'));
        }

        // Генерация слотов с учетом рабочих часов
        const slots = generateTimeSlots(location.workingHours, date);
        if (slots.length === 0) {
            return res.json([]); // Нет рабочих часов на этот день
        }

        // Поиск занятых слотов
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const bookings = await Booking.find({
            locationId,
            slot: { $gte: startOfDay, $lte: endOfDay },
            status: 'confirmed',
        });

        const bookedSlots = bookings.map((b) => b.slot.toISOString());

        // Фильтрация доступных слотов
        const availableSlots = slots.map((slot) => ({
            ...slot,
            available: !bookedSlots.includes(slot.time),
        }));

        res.json(availableSlots);
    } catch (err) {
        console.error('Error in getAvailableSlots:', err);
        next(new ApiError(500, 'Ошибка при получении доступных слотов'));
    }
};

function generateTimeSlots(workingHours, dateString) {
    const slots = [];
    const date = new Date(dateString);

    // Проверка валидности даты
    if (isNaN(date.getTime())) {
        return slots;
    }

    const day = date.getDay(); // 0 - воскресенье, 6 - суббота
    const workingDay = workingHours.find((wh) => wh.day === day);

    if (!workingDay) return slots;

    const { from: startHour, to: endHour } = workingDay;

    // Генерация слотов с интервалом в 1 час
    for (let hour = startHour; hour < endHour; hour++) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, 0, 0, 0);

        // Проверка, что слот не в прошлом
        if (slotTime > new Date()) {
            slots.push({
                time: slotTime.toISOString(),
                available: true,
                hour: hour,
                formattedTime: slotTime.toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            });
        }
    }

    return slots;
}
