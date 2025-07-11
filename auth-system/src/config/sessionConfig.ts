import session from 'express-session';

const sessionConfig = (isProduction: boolean) =>
  session({
    secret: process.env.SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: isProduction }, // Secure cookies in production
  });

export default sessionConfig;
