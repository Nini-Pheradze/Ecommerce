const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. ვნახოთ, არსებობს თუ არა უკვე მომხმარებელი ამ googleId-ით
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
            // 2. თუ googleId-ით ვერ ვიპოვეთ, ვეძებთ მეილით
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // თუ მეილით არსებობს, მივამაგროთ googleId
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false });
            } else {
                // თუ საერთოდ ახალია, შევქმნათ ახალი მომხმარებელი
                user = await User.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                isVerified: true, // გუგლიდან შემოსული მეილი უკვე ვერიფიცირებულია
                });
            }
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
        }
    )
);

// სესიის გამოყენების გარეშე (JWT-ის შემთხვევაში) სერიალიზაცია არ არის აუცილებელი, 
// მაგრამ რადგან Passport-ს იყენებ, კარგია რომ მარტივად დავტოვოთ:
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;