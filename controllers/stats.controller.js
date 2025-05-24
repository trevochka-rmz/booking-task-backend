import GameStats from '../models/GameStats.js';
import Booking from '../models/Booking.js';
import ApiError from '../utils/apiError.js';
import mongoose from 'mongoose';

export const saveGameStats = async (req, res, next) => {
    try {
        const requiredFields = [
            'userId',
            'locationId',
            'gameId',
            'correctAnswers',
            'totalQuestions',
        ];

        for (const field of requiredFields) {
            if (!req.body[field]) {
                throw new ApiError(400, `Missing required field: ${field}`);
            }
        }

        const stats = new GameStats({
            userId: req.body.userId,
            locationId: req.body.locationId,
            gameId: req.body.gameId,
            correctAnswers: req.body.correctAnswers,
            totalQuestions: req.body.totalQuestions,
            avgResponseTime: req.body.avgResponseTime,
            completionTime: req.body.completionTime,
            date: req.body.date || new Date(),
        });

        await stats.save();
        res.status(201).json(stats);
    } catch (err) {
        next(err);
    }
};

export const getUserGameStats = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        // Основная статистика
        const [generalStats, lastGames, favoriteLocation] = await Promise.all([
            // Общая статистика
            GameStats.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalGames: { $sum: 1 },
                        totalCorrect: { $sum: '$correctAnswers' },
                        totalQuestions: { $sum: '$totalQuestions' },
                        avgAccuracy: {
                            $avg: {
                                $multiply: [
                                    {
                                        $divide: [
                                            '$correctAnswers',
                                            '$totalQuestions',
                                        ],
                                    },
                                    100,
                                ],
                            },
                        },
                        avgCompletionTime: { $avg: '$completionTime' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalGames: 1,
                        totalCorrect: 1,
                        totalQuestions: 1,
                        avgAccuracy: { $round: ['$avgAccuracy', 2] },
                        avgCompletionTime: {
                            $round: ['$avgCompletionTime', 2],
                        },
                    },
                },
            ]),

            // Последние 5 игр
            GameStats.aggregate([
                { $match: { userId } },
                { $sort: { date: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'locations',
                        localField: 'locationId',
                        foreignField: '_id',
                        as: 'location',
                    },
                },
                { $unwind: '$location' },
                {
                    $lookup: {
                        from: 'games',
                        localField: 'gameId',
                        foreignField: '_id',
                        as: 'game',
                    },
                },
                { $unwind: '$game' },
                {
                    $project: {
                        _id: 0,
                        date: 1,
                        locationName: '$location.name',
                        gameName: '$game.name',
                        correctAnswers: 1,
                        totalQuestions: 1,
                        accuracy: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                '$correctAnswers',
                                                '$totalQuestions',
                                            ],
                                        },
                                        100,
                                    ],
                                },
                                2,
                            ],
                        },
                        completionTime: 1,
                    },
                },
            ]),

            // Самая частая локация
            Booking.aggregate([
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
                        _id: 0,
                        locationId: '$_id',
                        locationName: '$location.name',
                        gamesCount: '$count',
                    },
                },
            ]),
        ]);

        const result = {
            ...(generalStats[0] || {}),
            lastGames,
            favoriteLocation: favoriteLocation[0] || null,
        };

        res.json(result);
    } catch (err) {
        console.error('Error in getUserGameStats:', err);
        next(new ApiError(500, 'Error getting user statistics'));
    }
};

export const getGameStatsForAdmin = async (req, res, next) => {
    try {
        const { locationId, gameId, dateFrom, dateTo } = req.query;
        const filter = {};

        if (locationId)
            filter.locationId = new mongoose.Types.ObjectId(locationId);
        if (gameId) filter.gameId = gameId;
        if (dateFrom || dateTo) {
            filter.date = {};
            if (dateFrom) filter.date.$gte = new Date(dateFrom);
            if (dateTo) filter.date.$lte = new Date(dateTo);
        }

        const stats = await GameStats.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'locationId',
                    foreignField: '_id',
                    as: 'location',
                },
            },
            { $unwind: '$location' },
            {
                $project: {
                    _id: 1,
                    userName: '$user.name',
                    userEmail: '$user.email',
                    locationName: '$location.name',
                    gameId: 1,
                    correctAnswers: 1,
                    totalQuestions: 1,
                    accuracy: {
                        $round: [
                            {
                                $multiply: [
                                    {
                                        $divide: [
                                            '$correctAnswers',
                                            '$totalQuestions',
                                        ],
                                    },
                                    100,
                                ],
                            },
                            2,
                        ],
                    },
                    completionTime: 1,
                    date: 1,
                },
            },
            { $sort: { date: -1 } },
        ]);

        res.json(stats);
    } catch (err) {
        next(new ApiError(500, 'Error getting game statistics'));
    }
};
export const getUserGameHistory = async (req, res, next) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);

        const games = await GameStats.aggregate([
            { $match: { userId } },
            { $sort: { date: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'locations',
                    localField: 'locationId',
                    foreignField: '_id',
                    as: 'location',
                },
            },
            { $unwind: '$location' },
            {
                $project: {
                    _id: 1,
                    gameId: 1,
                    correctAnswers: 1,
                    totalQuestions: 1,
                    accuracy: { $round: ['$accuracy', 2] },
                    completionTime: 1,
                    date: 1,
                    locationName: '$location.name',
                    locationImage: '$location.image',
                },
            },
        ]);

        res.json(games);
    } catch (err) {
        next(new ApiError(500, 'Error getting game history'));
    }
};
