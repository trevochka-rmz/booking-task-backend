import { logger } from '../utils/logger.js';

export default (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    logger.error(`${err.statusCode} - ${err.message}`);

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        errors: err.errors,
    });
};
