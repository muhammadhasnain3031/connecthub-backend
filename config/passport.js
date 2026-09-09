import dotenv from 'dotenv';
dotenv.config();


import passport  from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
    console.log("GOOGLE CLIENT ID IN PASSPORT:", process.env.GOOGLE_CLIENT_ID)

passport.use(

  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

export default passport;