import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        username: { type: String, unique: true, sparse: true },
        profile: {
            name: { type: String, required: true },
            phone: { type: String },
            avatar: { type: String },
            gender: {
                type: String,
                enum: ['male', 'female', 'other', 'prefer-not-to-say'],
            },
            birthDate: { type: Date },
            nativeLanguage: { type: String, default: 'ru' },
            status: {
                type: String,
                enum: ['student', 'working', 'freelancer', 'other'],
            },
            bio: { type: String, maxlength: 500 },
            socials: {
                vk: String,
                telegram: String,
                instagram: String,
            },
        },
        stats: {
            gamesPlayed: { type: Number, default: 0 },
            avgScore: { type: Number, default: 0 },
            favoriteGame: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
        },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        completedOnboarding: { type: Boolean, default: false },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.password;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Виртуальное поле для возраста
UserSchema.virtual('profile.age').get(function () {
    if (!this.profile.birthDate) return null;
    const diff = Date.now() - this.profile.birthDate.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

export default mongoose.model('User', UserSchema);
