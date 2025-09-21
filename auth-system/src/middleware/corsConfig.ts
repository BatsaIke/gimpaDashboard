import cors from 'cors';

const corsConfig = (isProduction: boolean) =>
  cors({
    origin: isProduction ? 'gimpa-dashboard-6vdcnbce7-batsaikes-projects.vercel.app/api/v1' : 'http://localhost:3000',
    credentials: true,
  });

export default corsConfig;
