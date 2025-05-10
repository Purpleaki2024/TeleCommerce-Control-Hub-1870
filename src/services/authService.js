import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from '../bot/config.js';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

export const hashPassword = async (password) => {
  return bcrypt.hash(password, 12);
};

export const comparePasswords = async (password, hash) => {
  return bcrypt.compare(password, hash);
};