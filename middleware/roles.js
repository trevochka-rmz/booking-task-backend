import ApiError from '../utils/apiError.js';

export const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new ApiError(403, 'Forbidden: Admin access required'));
    }
    next();
};

export const checkFranchisee = (req, res, next) => {
    if (req.user.role !== 'franchisee' && req.user.role !== 'admin') {
        return next(new ApiError(403, 'Forbidden: Franchisee access required'));
    }
    next();
};
