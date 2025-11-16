import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userService, User } from '../services/userService';

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      // Check if user exists
      let user = await userService.findByUsername(username);

      if (!user) {
        // Auto-register if user doesn't exist
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await userService.create(username, hashedPassword);
      } else {
        // Validate password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      }

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
      return;
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ error: 'Authentication failed' });
      return;
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      // Check if user already exists
      const existingUser = await userService.findByUsername(username);
      if (existingUser) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await userService.create(username, hashedPassword);

      // Create JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          username: user.username
        }
      });
      return;
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ error: 'Registration failed' });
      return;
    }
  }
};