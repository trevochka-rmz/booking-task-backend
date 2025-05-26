import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        logger.info('✅ MongoDB connected');
    } catch (err) {
        logger.error('❌ MongoDB connection error:', err);
        process.exit(1);
    }
};

export const disconnectDB = async () => {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
};
