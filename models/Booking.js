import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema(
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
        slot: {
            type: Date,
            required: true,
        },
        players: {
            type: Number,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'confirmed',
        },
    },
    { timestamps: true }
);

// Добавляем индексы для часто используемых запросов
BookingSchema.index({ userId: 1 });
BookingSchema.index({ locationId: 1 });
BookingSchema.index({ slot: 1 });

export default mongoose.model('Booking', BookingSchema);
