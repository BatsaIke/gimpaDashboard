import { Router } from 'express';
import authRoutes from './auth';

const router = Router();

router.use('/auth', authRoutes);
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello, your API is running!' });
});

export default router;
