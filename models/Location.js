import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        country: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        capacity: { type: Number, required: true },
        franchiseEmail: { type: String, required: true },
        workingHours: [
            {
                day: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
                from: { type: Number, required: true }, // 8 for 8:00
                to: { type: Number, required: true }, // 22 for 22:00
            },
        ],
        games: [
            {
                id: { type: String, required: true },
                name: { type: String, required: true },
                duration: { type: Number, required: true }, // in minutes
                minPlayers: { type: Number, required: true },
                maxPlayers: { type: Number, required: true },
                languages: {
                    type: [String],
                    default: ['ru'],
                    enum: ['ru', 'en', 'ge', 'fr'],
                },
            },
        ],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model('Location', LocationSchema);
