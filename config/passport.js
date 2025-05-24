import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};

passport.use(
    new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
        try {
            const user = await User.findById(jwtPayload.id);
            if (user) return done(null, user);
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    })
);

export default passport;
