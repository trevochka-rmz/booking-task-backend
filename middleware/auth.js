import passport from 'passport';
import ApiError from '../utils/apiError.js';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return next(new ApiError(401, 'Unauthorized'));
        }
        req.user = user;
        next();
    })(req, res, next);
};

export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return next(new ApiError(401, 'Unauthorized'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id: user._id }
        next();
    } catch (err) {
        next(new ApiError(401, 'Invalid token'));
    }
};
