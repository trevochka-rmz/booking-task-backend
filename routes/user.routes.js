import express from 'express';
import multer from 'multer';
import passport from 'passport';

import {
    getProfile,
    updateProfile,
    getUserStats,
} from '../controllers/user.controller.js';

const router = express.Router();
const upload = multer();

router.use(passport.authenticate('jwt', { session: false }));

// Личный кабинет
router.get('/me', getProfile);
router.get('/me/stats', getUserStats);
router.patch(
    '/me',
    upload.fields([{ name: 'avatar', maxCount: 1 }]),
    updateProfile
);

export default router;
