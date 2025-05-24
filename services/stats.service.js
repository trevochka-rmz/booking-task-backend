import GameStats from '../models/GameStats.js';
import { logger } from '../utils/logger.js';

export const calculateUserRanking = async (userId) => {
    try {
        const stats = await GameStats.aggregate([
            { $match: { userId } },
            { $group: { _id: null, avgScore: { $avg: '$correctAnswers' } } },
        ]);
        return stats[0]?.avgScore || 0;
    } catch (err) {
        logger.error('Failed to calculate user ranking:', err);
        throw err;
    }
};

export const getGameAnalytics = async (locationId) => {
    try {
        return GameStats.aggregate([
            { $match: { locationId } },
            {
                $group: {
                    _id: '$language',
                    avgDuration: { $avg: '$gameDuration' },
                    totalGames: { $sum: 1 },
                },
            },
        ]);
    } catch (err) {
        logger.error('Failed to fetch game analytics:', err);
        throw err;
    }
};
