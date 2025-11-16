import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

// Update clipboard service to use database
interface ClipboardItem {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'file';
  fileName?: string;
  mimeType?: string;
  createdAt: Date;
  isGuest: boolean;
}

export const clipboardService = {
  // Create a new clipboard item for authenticated user
  create: async (userId: string, content: string, type: 'text' | 'file', fileName?: string, mimeType?: string) => {
    const stmt = db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const id = uuidv4();
    stmt.run([id, userId, content, type, fileName, mimeType, 0]);

    // Return the created item
    return await clipboardService.getById(id);
  },

  // Get latest clipboard item for a user
  getLatestByUser: async (userId: string) => {
    const stmt = db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const result = stmt.get(userId);
    return result || null;
  },

  // Create a new clipboard item for guest
  createGuest: async (content: string, type: 'text' | 'file', fileName?: string, mimeType?: string) => {
    const stmt = db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const id = uuidv4();
    stmt.run([id, null, content, type, fileName, mimeType, 1]);

    // Return the created item
    return await clipboardService.getById(id);
  },

  // Get latest clipboard item for guests
  getLatestGuest: async () => {
    const stmt = db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE is_guest = 1
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const result = stmt.get();
    return result || null;
  },

  // Get clipboard item by ID
  getById: async (id: string) => {
    const stmt = db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE id = ?
    `);

    const result = stmt.get(id);
    return result || null;
  },

  // Helper function to fix filename encoding
  fixFileNameEncoding: (originalName: string): string => {
    try {
      // Check if the filename contains common encoding artifacts
      if (originalName.includes('æ') || originalName.includes('ä¸') || originalName.includes('é')) {
        // This looks like a UTF-8 string that was incorrectly decoded as Latin-1
        // Convert back to UTF-8 bytes and re-interpret
        const buffer = Buffer.from(originalName, 'binary');
        return buffer.toString('utf-8');
      }
      return originalName;
    } catch (error) {
      console.error('Error fixing filename encoding:', error);
      return originalName; // fallback to original if error occurs
    }
  },

  // Create a file clipboard item for authenticated user
  createFile: async (userId: string, file: Express.Multer.File) => {
    const stmt = db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const id = uuidv4();
    const fixedFileName = clipboardService.fixFileNameEncoding(file.originalname);
    stmt.run([id, userId, `/api/files/${file.filename}`, 'file', fixedFileName, file.mimetype, 0]);

    // Return the created item
    return await clipboardService.getById(id);
  },

  // Create a file clipboard item for guest
  createGuestFile: async (file: Express.Multer.File) => {
    const stmt = db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const id = uuidv4();
    const fixedFileName = clipboardService.fixFileNameEncoding(file.originalname);
    stmt.run([id, null, `/api/files/${file.filename}`, 'file', fixedFileName, file.mimetype, 1]);

    // Return the created item
    return await clipboardService.getById(id);
  }
};