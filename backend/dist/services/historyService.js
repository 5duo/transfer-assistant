"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
exports.historyService = {
    getAllByUser: async (userId) => {
        const stmt = database_1.db.prepare(`
      SELECT * FROM clipboard_items
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
        const result = stmt.all(userId);
        return result;
    },
    create: async (userId, content, type, fileName, mimeType) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO clipboard_items (id, user_id, content, type, file_name, mime_type, is_guest)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        stmt.run([id, userId, content, type, fileName, mimeType, 0]);
        return await exports.historyService.getById(id);
    },
    deleteById: async (userId, id) => {
        const stmt = database_1.db.prepare(`
      DELETE FROM clipboard_items
      WHERE id = ? AND user_id = ?
    `);
        stmt.run([id, userId]);
    },
    setAsLatest: async (userId, id) => {
        const stmt = database_1.db.prepare(`
      SELECT * FROM clipboard_items
      WHERE id = ? AND user_id = ?
    `);
        const result = stmt.get(id, userId);
        if (!result) {
            throw new Error('History item not found');
        }
        return result;
    },
    getById: async (id) => {
        const stmt = database_1.db.prepare(`
      SELECT * FROM clipboard_items
      WHERE id = ?
    `);
        const result = stmt.get(id);
        return result || null;
    }
};
//# sourceMappingURL=historyService.js.map