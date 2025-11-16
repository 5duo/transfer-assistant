import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Update user service to use database
export interface User {
  id: string;
  username: string;
  password: string; // This will be hashed
}

export const userService = {
  findByUsername: async (username: string): Promise<User | null> => {
    const stmt = db.prepare('SELECT id, username, password FROM users WHERE username = ?');
    const result = stmt.get(username) as User | undefined;
    return result || null;
  },

  create: async (username: string, hashedPassword: string): Promise<User> => {
    const stmt = db.prepare(`
      INSERT INTO users (id, username, password)
      VALUES (?, ?, ?)
    `);

    const id = uuidv4();
    stmt.run([id, username, hashedPassword]);

    // Return the created user
    const user = await userService.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  },

  findById: async (id: string): Promise<User | null> => {
    const stmt = db.prepare('SELECT id, username, password FROM users WHERE id = ?');
    const result = stmt.get(id) as User | undefined;
    return result || null;
  }
};