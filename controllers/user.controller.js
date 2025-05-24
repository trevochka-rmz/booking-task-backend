import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

export const completeOnboarding = async (req, res, next) => {
    try {
        const {
            username,
            name,
            phone,
            gender,
            birthDate,
            nativeLanguage,
            status,
            bio,
        } = req.body;

        // Валидация
        if (!username || !name) {
            throw new ApiError(400, 'Имя и никнейм обязательны');
        }

        // Проверка уникальности никнейма
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
            throw new ApiError(400, 'Этот никнейм уже занят');
        }

        // Загрузка аватарки
        let avatarUrl;
        if (req.file) {
            avatarUrl = await uploadImage(req.file);
        }

        const updateData = {
            username,
            completedOnboarding: true,
            profile: {
                name,
                phone,
                gender,
                birthDate: birthDate ? new Date(birthDate) : null,
                nativeLanguage,
                status,
                bio,
                ...(avatarUrl && { avatar: avatarUrl }),
            },
        };

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        // Данные из FormData (используем req.fields, если formidable)
        const {
            name,
            // phone,
            gender,
            birthDate,
            nativeLanguage,
            status,
            bio,
            socials,
        } = req.body;

        // console.log('Fields:', req.body); // Проверяем данные
        // console.log('File:', req.file); // Проверяем файл

        if (!name) throw new ApiError(400, 'Имя обязательно');

        const updateData = {
            profile: {
                name,
                // phone,
                gender,
                ...(birthDate && { birthDate: new Date(birthDate) }),
                nativeLanguage,
                status,
                bio,
                socials: socials ? JSON.parse(socials) : {},
            },
        };

        // if (req.file) {
        //     updateData.profile.avatar = await uploadImage(req.file);
        // }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        next(err);
    }
};
export const getUserStats = async (req, res, next) => {
    try {
        // Правильное создание ObjectId
        const userId = new mongoose.Types.ObjectId(req.user.id);

        const stats = {
            totalGames: await Booking.countDocuments({ userId }),
            lastPlayed: await Booking.findOne({ userId })
                .sort({ createdAt: -1 })
                .select('createdAt')
                .lean(),
            favoriteLocation: await Booking.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$locationId',
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 1 },
                {
                    $lookup: {
                        from: 'locations',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'location',
                    },
                },
                { $unwind: '$location' },
                {
                    $project: {
                        locationName: '$location.name',
                        count: 1,
                    },
                },
            ]),
        };

        // Добавляем проверку на пустой результат
        if (stats.favoriteLocation.length > 0) {
            stats.favoriteLocation = stats.favoriteLocation[0];
        } else {
            stats.favoriteLocation = null;
        }

        res.json(stats);
    } catch (err) {
        console.error('Error in getUserStats:', err);
        next(new ApiError(500, 'Ошибка при получении статистики'));
    }
};

export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password -refreshToken')
            .lean();

        if (!user) {
            throw new ApiError(404, 'Пользователь не найден');
        }

        const userId = new mongoose.Types.ObjectId(req.user.id);
        const bookingsCount = await Booking.countDocuments({ userId });

        res.json({
            ...user,
            stats: { bookingsCount },
        });
    } catch (err) {
        console.error('Error in getProfile:', err);
        next(new ApiError(500, 'Ошибка при получении профиля'));
    }
};
