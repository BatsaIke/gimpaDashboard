import cors from 'cors';

const corsConfig = (isProduction: boolean) =>
  cors({
    origin: isProduction ? 'https://your-production-url.com' : 'http://localhost:3000',
    credentials: true,
  });

export default corsConfig;
