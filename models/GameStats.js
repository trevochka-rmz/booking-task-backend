import mongoose from 'mongoose';

const GameStatsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location',
            required: true,
        },
        gameId: {
            type: String,
            required: true,
        },
        correctAnswers: {
            type: Number,
            required: true,
            min: 0,
        },
        totalQuestions: {
            type: Number,
            required: true,
            min: 1,
        },
        avgResponseTime: {
            type: Number,
            min: 0,
        },
        completionTime: {
            // в минутах
            type: Number,
            min: 1,
        },
        language: {
            type: String,
            enum: ['ru', 'en', 'ge', 'fr'],
            default: 'ru',
        },
        date: {
            type: Date,
            default: Date.now,
        },
        points: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Виртуальное поле для точности
GameStatsSchema.virtual('accuracy').get(function () {
    return (this.correctAnswers / this.totalQuestions) * 100;
});

// Индексы для часто используемых запросов
GameStatsSchema.index({ userId: 1 });
GameStatsSchema.index({ locationId: 1 });
GameStatsSchema.index({ date: -1 });

export default mongoose.model('GameStats', GameStatsSchema);
