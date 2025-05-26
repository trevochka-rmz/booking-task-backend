import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from './config/passport.js';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import statsRoutes from './routes/stats.routes.js';
import userRoutes from './routes/user.routes.js';
import errorHandler from './middleware/errorHandler.js';
import locationRoutes from './routes/location.routes.js';
// import formidable from 'express-formidable';

const app = express();

// Middleware
const corsOptions = {
    origin: 'https://booking-task-frontend.vercel.app', // или '*' для всех доменов (не рекомендуется для продакшена)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Явно разрешаем PATCH
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Если используете куки/авторизацию
};
app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

// app.options('*', cors(corsOptions)); // Для preflight запросов
app.use(express.json());
// app.use(formidable());
app.use(passport.initialize());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/user', userRoutes);

// Error handling
app.use(errorHandler);

// Database connection
connectDB();

export default app;
