import express from 'express';
import passport from '../utils/passportConfig';
import { verifyToken } from '../middleware/authMiddleware';
import {
  login,
  refreshToken,
  createUser,
  getStaff,
  getUserById,
  deleteUser,
  resetPassword,
  changePassword,
  signupSuperAdmin,
  getMe
} from '../controllers/authController/authController';
import { updateUser } from '../controllers/authController/updateUser/updateUser';

const router = express.Router();

/* Google login (if you want to keep it) */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/v1/auth/login' }),
  (req, res) => res.redirect('/') // Successful authentication
);

/* Auth */
router.post('/login', login);
router.post('/refresh', refreshToken);

/* User management (protected - Super Admin only for createUser) */
router.post('/users', verifyToken, createUser);         // Create any user (Super Admin only)
router.get('/users', verifyToken, getStaff);            // List staff accessible to caller
router.get('/users/:id', verifyToken, getUserById);     // Get single user by ID
router.patch('/users/:id', verifyToken, updateUser);    // Update user
router.delete('/users/:id', verifyToken, deleteUser);   // Delete user
router.post('/signup/super-admin', signupSuperAdmin);

/* Password ops (protected) */
router.post('/users/:id/reset-password', verifyToken, resetPassword);
router.post('/users/:id/change-password', verifyToken, changePassword);
router.get('/me', verifyToken, getMe);


export default router;
