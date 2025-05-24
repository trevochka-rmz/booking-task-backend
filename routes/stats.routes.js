import express from 'express';
import passport from 'passport';
import {
    saveGameStats,
    getUserGameStats,
    getGameStatsForAdmin,
    getUserGameHistory,
} from '../controllers/stats.controller.js';

const router = express.Router();

// Для игрового сервера (сохранение статистики после игры)
router.post('/', saveGameStats);

// Для пользователя (получение своей статистики)
router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    getUserGameStats
);
router.get(
    '/me/games',
    passport.authenticate('jwt', { session: false }),
    getUserGameHistory
);
// Для администратора (получение полной статистики)
router.get(
    '/admin',
    passport.authenticate('jwt', { session: false }),
    (req, res, next) => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    },
    getGameStatsForAdmin
);

export default router;
