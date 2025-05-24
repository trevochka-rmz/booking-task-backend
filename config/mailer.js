import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Booking System" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        logger.info(`✉️ Email sent to ${to}`);
    } catch (err) {
        logger.error('❌ Email send error:', err);
        throw err;
    }
};
