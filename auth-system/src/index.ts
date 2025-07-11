import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import passport from './utils/passportConfig';
import connectDB from './config/db';
import sessionConfig from './config/sessionConfig';
import corsConfig from './middleware/corsConfig';
import loggingMiddleware from './middleware/logging';
import errorHandler from './middleware/errorHandler';
import routes from './routes';
import departmentRoutes from './routes/departmentRoutes';
import employeesRoutes from './routes/employeesRoutes';
import kpiRoutes from './routes/kpiRoutes';  
import kpiHeaderRoutes from './routes/kpiHeadersRoutes';  
import roleRoutes from './routes/roleRoutes';  
import discrepancyRoutes from './routes/discrepancyRoutes'; 




dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.DB_URI || '';
const isProduction = process.env.NODE_ENV === 'production';

// ✅ Middleware
app.use(express.json());
app.use(cookieParser());
app.use(corsConfig(isProduction));
app.use(loggingMiddleware(isProduction));
app.use(sessionConfig(isProduction));

// ✅ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ Serve static files for uploaded documents
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use('/api/v1/', routes);
app.use("/api/v1", departmentRoutes);
app.use("/api/v1", employeesRoutes);
app.use("/api/v1/kpis", kpiRoutes); 
app.use("/api/v1/roles", roleRoutes); 

app.use("/api/v1/kpi-headers", kpiHeaderRoutes);
app.use("/api/v1/discrepancies", discrepancyRoutes); 

// ✅ Error Handling Middleware 
app.use(errorHandler); 

// ✅ Process-Level Error Handling 
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ✅ Database Connection & Start Server
connectDB(DB_URI).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
