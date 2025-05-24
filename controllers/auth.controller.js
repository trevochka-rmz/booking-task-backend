import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/apiError.js';
import { sendEmail } from '../config/mailer.js';

export const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Проверка существования пользователя
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'Email уже используется'));
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 12);

        // Создание пользователя с минимально необходимыми полями
        const user = new User({
            email,
            password: hashedPassword,
            profile: {
                name: email.split('@')[0], // Генерируем имя из email (или другое значение)
            },
        });

        await user.save();

        // Генерация токена
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(201).json({
            token,
            userId: user._id,
            message: 'Регистрация успешна. Завершите onboarding в профиле.',
        });
    } catch (err) {
        console.error('Registration error:', err);
        next(new ApiError(500, 'Ошибка при регистрации: ' + err.message));
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return next(
                new ApiError(401, 'Пользователь с таким email не найден')
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ApiError(401, 'Неверный пароль'));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).json({ token, userId: user._id });
    } catch (err) {
        next(new ApiError(500, 'Ошибка при входе в систему'));
    }
};

export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return next(new ApiError(404, 'Пользователь не найден'));
        }
        res.json(user);
    } catch (err) {
        next(new ApiError(500, 'Failed to fetch user'));
    }
};

export const logout = async (req, res, next) => {
    try {
        // В реальном приложении здесь можно:
        // 1. Добавить токен в черный список
        // 2. Записать время выхода в базу
        // 3. Очистить связанные сессии

        res.status(200).json({
            success: true,
            message: 'Успешно выйдено с аккаунта',
        });
    } catch (err) {
        next(new ApiError(500, 'Ошибка при выходе'));
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) throw new ApiError(404, 'Пользователь не найден');

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '15m',
        });

        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        await sendEmail(
            email,
            'Password Reset',
            `Click the link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`
        );

        res.json({
            success: true,
            message: 'На почту пришло сообщение с новым пароль',
        });
    } catch (err) {
        console.error('Password reset error:', err);
        next(
            new ApiError(500, 'Password reset failed. Please try again later.')
        );
    }
};
