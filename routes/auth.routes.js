import express from 'express';
import {
    register,
    login,
    forgotPassword,
    getCurrentUser,
    logout,
} from '../controllers/auth.controller.js';
import { validateRegistration } from '../middleware/validation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', verifyToken, getCurrentUser);
router.post('/logout', verifyToken, logout);

export default router;
