import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Update history service to use database
interface HistoryItem {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'file';
  fileName?: string;
  mimeType?: string;
  createdAt: Date;
}

export const historyService = {
  getAllByUser: async (userId: string) => {
    const stmt = db.prepare(`
      SELECT * FROM clipboard_items
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);

    const result = stmt.all(userId);
    return result;
  },

  create: async (userId: string, content: string, type: 'text' | 'file', fileName?: string, mimeType?: string) => {
    const stmt = db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const id = uuidv4();
    stmt.run([id, userId, content, type, fileName, mimeType, 0]);

    // Return the created item
    return await historyService.getById(id);
  },

  deleteById: async (userId: string, id: string) => {
    const stmt = db.prepare(`
      DELETE FROM clipboard_items
      WHERE id = ? AND user_id = ?
    `);

    stmt.run([id, userId]);
  },

  setAsLatest: async (userId: string, id: string) => {
    const stmt = db.prepare(`
      SELECT * FROM clipboard_items
      WHERE id = ? AND user_id = ?
    `);

    const result = stmt.get(id, userId);
    if (!result) {
      throw new Error('History item not found');
    }

    return result;
  },

  getById: async (id: string) => {
    const stmt = db.prepare(`
      SELECT * FROM clipboard_items
      WHERE id = ?
    `);

    const result = stmt.get(id);
    return result || null;
  }
};