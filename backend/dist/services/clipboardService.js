"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clipboardService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
exports.clipboardService = {
    create: async (userId, content, type, fileName, mimeType) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        stmt.run([id, userId, content, type, fileName, mimeType, 0]);
        return await exports.clipboardService.getById(id);
    },
    getLatestByUser: async (userId) => {
        const stmt = database_1.db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
        const result = stmt.get(userId);
        return result || null;
    },
    createGuest: async (content, type, fileName, mimeType) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        stmt.run([id, null, content, type, fileName, mimeType, 1]);
        return await exports.clipboardService.getById(id);
    },
    getLatestGuest: async () => {
        const stmt = database_1.db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE is_guest = 1
      ORDER BY created_at DESC
      LIMIT 1
    `);
        const result = stmt.get();
        return result || null;
    },
    getById: async (id) => {
        const stmt = database_1.db.prepare(`
      SELECT *, datetime(created_at, 'localtime') as created_at FROM clipboard_items
      WHERE id = ?
    `);
        const result = stmt.get(id);
        return result || null;
    },
    fixFileNameEncoding: (originalName) => {
        try {
            if (originalName.includes('æ') || originalName.includes('ä¸') || originalName.includes('é')) {
                const buffer = Buffer.from(originalName, 'binary');
                return buffer.toString('utf-8');
            }
            return originalName;
        }
        catch (error) {
            console.error('Error fixing filename encoding:', error);
            return originalName;
        }
    },
    createFile: async (userId, file) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        const fixedFileName = exports.clipboardService.fixFileNameEncoding(file.originalname);
        stmt.run([id, userId, `/api/files/${file.filename}`, 'file', fixedFileName, file.mimetype, 0]);
        return await exports.clipboardService.getById(id);
    },
    createGuestFile: async (file) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        const fixedFileName = exports.clipboardService.fixFileNameEncoding(file.originalname);
        stmt.run([id, null, `/api/files/${file.filename}`, 'file', fixedFileName, file.mimetype, 1]);
        return await exports.clipboardService.getById(id);
    }
};
//# sourceMappingURL=clipboardService.js.map