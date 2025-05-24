import Booking from '../models/Booking.js';
import Location from '../models/Location.js';
import User from '../models/User.js';
import { sendEmail } from '../config/mailer.js';
import ApiError from '../utils/apiError.js';

export const createBooking = async (req, res, next) => {
    try {
        const { locationId, gameId, slot, players, language, email } = req.body;

        const slotDate = new Date(slot);
        if (isNaN(slotDate.getTime())) {
            throw new ApiError(400, 'Некорректная дата бронирования');
        }

        if (slotDate < new Date()) {
            throw new ApiError(400, 'Нельзя бронировать прошедшие даты');
        }
        // Проверка данных
        const location = await Location.findById(locationId);
        if (!location) throw new ApiError(404, 'Локация не найдена');

        const game = location.games.find((g) => g.id === gameId);
        if (!game) throw new ApiError(404, 'Игра не найдена');

        if (players < game.minPlayers || players > game.maxPlayers) {
            throw new ApiError(
                400,
                `Количество игроков должно быть от ${game.minPlayers} до ${game.maxPlayers}`
            );
        }

        const supportedLanguages = game.languages || ['ru']; // По умолчанию русский
        if (!supportedLanguages.includes(language)) {
            throw new ApiError(
                400,
                `Выбранный язык недоступен для этой игры. Доступные языки: ${supportedLanguages.join(
                    ', '
                )}`
            );
        }

        // // Проверка доступности слота
        // const existingBooking = await Booking.findOne({
        //     locationId,
        //     slot: new Date(`${date}T${slot.split('-')[0]}:00`),
        //     status: 'confirmed',
        // });

        // if (existingBooking) {
        //     throw new ApiError(400, 'Это время уже занято');
        // }

        // Создание брони
        const booking = new Booking({
            userId: req.user?.id,
            locationId,
            gameId,
            slot: slotDate,
            players,
            language,
            email,
            status: 'confirmed',
        });

        await booking.save();

        // Подготовка данных для email
        const bookingDate = new Date(
            `${slotDate}T${slot.split('-')[0]}:00`
        ).toLocaleString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const durationHours = Math.floor(game.duration / 60);
        const durationMinutes = game.duration % 60;
        const durationStr = `${
            durationHours > 0 ? `${durationHours} ч ` : ''
        }${durationMinutes} мин`;

        // Отправка email пользователю
        await sendEmail(
            email,
            `Подтверждение бронирования: ${game.name}`,
            `
                <h1>Ваше бронирование подтверждено!</h1>
                <p><strong>Локация:</strong> ${location.name}, ${
                location.city
            }</p>
                <p><strong>Адрес:</strong> ${location.address}</p>
                <p><strong>Игра:</strong> ${game.name}</p>
                <p><strong>Дата и время:</strong> ${bookingDate}</p>
                <p><strong>Продолжительность:</strong> ${durationStr}</p>
                <p><strong>Количество игроков:</strong> ${players}</p>
                <p><strong>Язык:</strong> ${getLanguageName(language)}</p>
                <p>Спасибо за бронирование! Ждем вас в указанное время.</p>
            `
        );

        // Отправка уведомления франчайзи
        await sendEmail(
            location.franchiseEmail,
            `Новое бронирование: ${game.name}`,
            `
                <h2>Детали бронирования</h2>
                <p><strong>Локация:</strong> ${location.name}</p>
                <p><strong>Игра:</strong> ${game.name}</p>
                <p><strong>Дата и время:</strong> ${bookingDate}</p>
                <p><strong>Количество игроков:</strong> ${players}</p>
                <p><strong>Язык:</strong> ${getLanguageName(language)}</p>
                <p><strong>Контактный email:</strong> ${email}</p>
                ${
                    req.user
                        ? `<p><strong>Пользователь:</strong> ${
                              req.user.name || 'Не указано'
                          } (${req.user.email})</p>`
                        : ''
                }
            `
        );

        res.status(201).json({
            success: true,
            bookingId: booking._id,
        });
    } catch (err) {
        next(err);
    }
};

function getLanguageName(code) {
    const languages = {
        ru: 'Русский',
        en: 'English',
        ge: 'Deutsch',
        fr: 'Français',
    };
    return languages[code] || code;
}

export const getUserBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('locationId', 'name address price')
            .sort({ slot: -1 });

        res.json(bookings);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении бронирований'));
    }
};

export const cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user.id,
                status: 'confirmed',
            },
            { status: 'cancelled' },
            { new: true }
        ).populate('locationId', 'name franchiseEmail');

        if (!booking) {
            throw new ApiError(404, 'Бронь не найдена или уже отменена');
        }

        // Уведомление об отмене
        const user = await User.findById(req.user.id);
        const bookingDate = new Date(booking.slot).toLocaleString('ru-RU');

        await sendEmail(
            user.email,
            'Бронирование отменено',
            `Ваша бронь на квест "${booking.locationId.name}" отменена`
        );

        await sendEmail(
            booking.locationId.franchiseEmail,
            'Отмена бронирования',
            `Бронь отменена:\n\nЛокация: ${
                booking.locationId.name
            }\nДата: ${bookingDate}\nКлиент: ${user.name || 'Не указано'} (${
                user.email
            })`
        );

        res.json(booking);
    } catch (err) {
        next(err);
    }
};

export const getAvailableSlots = async (req, res, next) => {
    try {
        const { date } = req.query;
        const location = await Location.findById(req.params.locationId);

        if (!location) {
            throw new ApiError(404, 'Локация не найдена');
        }

        // Генерация рабочих часов
        const dayOfWeek = new Date(date).getDay();
        const workingHours = location.workingHours.find(
            (wh) => wh.day === dayOfWeek
        ) || {
            from: 10,
            to: 22,
        };

        // Генерация всех возможных слотов
        const allSlots = [];
        for (let hour = workingHours.from; hour < workingHours.to; hour++) {
            allSlots.push({
                time: new Date(new Date(date).setHours(hour, 0, 0, 0)),
                available: true,
            });
        }

        // Проверка занятых слотов
        const bookings = await Booking.find({
            locationId: req.params.locationId,
            slot: {
                $gte: new Date(date + 'T00:00:00'),
                $lte: new Date(date + 'T23:59:59'),
            },
            status: 'confirmed',
        });

        const availableSlots = allSlots.map((slot) => {
            const isBooked = bookings.some(
                (b) => new Date(b.slot).getHours() === slot.time.getHours()
            );
            return {
                time: slot.time.toISOString(),
                available: !isBooked,
            };
        });

        res.json(availableSlots);
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении доступных слотов'));
    }
};
export const getUserBookingStats = async (req, res, next) => {
    try {
        const stats = await Booking.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalBookings: { $sum: 1 },
                    upcomingBookings: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$status', 'confirmed'] },
                                        { $gt: ['$slot', new Date()] },
                                    ],
                                },
                                1,
                                0,
                            ],
                        },
                    },
                    lastBookingDate: { $max: '$slot' },
                },
            },
            { $project: { _id: 0 } },
        ]);

        res.json(stats[0] || {});
    } catch (err) {
        next(new ApiError(500, 'Ошибка при получении статистики бронирований'));
    }
};
