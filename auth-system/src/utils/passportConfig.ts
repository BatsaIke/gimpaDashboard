import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import User, { IUser } from '../models/User';
import dotenv from 'dotenv';
dotenv.config();


// Serialize user into the session
passport.serializeUser((user: Express.User, done: (err: any, id?: unknown) => void): void => {
  done(null, (user as IUser)._id); // Use the user's MongoDB _id
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done: (err: any, user?: Express.User | false) => void): Promise<void> => {
  try {
    const user = await User.findById(id);
    if (user) {
      done(null, user);
    } else {
      done(null, false); // User not found
    }
  } catch (error) {
    done(error, false); // Error occurred
  }
});



passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });
          if (!user) {
            user = await User.create({
              fullName: profile.displayName,
              email: profile.emails?.[0].value,
              isOAuth: true,
            });
          }
          done(null, user);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
  

// Facebook Strategy (Removed)
// Commented or deleted for now

export default passport;
