import express from 'express';
import passport from 'passport';
import {
    getLocations,
    getLocationById,
    createLocation,
    updateLocation,
    getAvailableSlots,
} from '../controllers/location.controller.js';
// import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getLocations);
router.get('/:id', getLocationById);

// Защищенные маршруты (требуется аутентификация)
router.use(passport.authenticate('jwt', { session: false }));

// Доступ только для админа
router.post('/', createLocation);
// router.post('/', isAdmin, createLocation);
// router.put('/:id', isAdmin, updateLocation);
router.put('/:id', updateLocation);

// Доступные слоты (для авторизованных пользователей)
router.get('/:locationId/slots', getAvailableSlots);

export default router;
