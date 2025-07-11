import bcrypt from 'bcrypt';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import ms from 'ms'; // <-- Import for ms.StringValue type
import * as crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// Hash a password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
// Accept either a number (seconds) or an 'ms' string (e.g., "1h", "2d", etc.)
export const generateToken = (id: string, role: string, expiresIn: number | ms.StringValue): string => {
  const secret: Secret = process.env.JWT_SECRET as string;
  const options: SignOptions = { expiresIn };

  // Include `role` in the token payload
  return jwt.sign({ id, role }, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (id: string, expiresIn: number | ms.StringValue): string => {
  const secret: Secret = process.env.JWT_REFRESH_SECRET as string;
  const options: SignOptions = { expiresIn };
  return jwt.sign({ id }, secret, options);
};

// Generate random reset token
export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString('hex');
};
