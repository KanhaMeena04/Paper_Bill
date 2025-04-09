const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const existingUser = await User.findOne({ socialId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        }

        const user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            socialId: profile.id,
            isVerified: true,
        });

        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, done));
