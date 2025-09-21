// src/middleware/corsConfig.ts

import cors, { CorsOptions } from 'cors';

const allowedOrigins: string[] = [
  'https://gimpa-dashboard.vercel.app',
  'http://localhost:3000',
  'https://gimpa-dashboard-6vdcnbce7-batsaikes-projects.vercel.app'
];

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('This origin is not allowed by CORS'));
    }
  },
  credentials: true,
};

const corsConfig = () => cors(corsOptions);

export default corsConfig;