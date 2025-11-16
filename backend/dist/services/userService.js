"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid");
exports.userService = {
    findByUsername: async (username) => {
        const stmt = database_1.db.prepare('SELECT id, username, password FROM users WHERE username = ?');
        const result = stmt.get(username);
        return result || null;
    },
    create: async (username, hashedPassword) => {
        const stmt = database_1.db.prepare(`
      INSERT INTO users (id, username, password)
      VALUES (?, ?, ?)
    `);
        const id = (0, uuid_1.v4)();
        stmt.run([id, username, hashedPassword]);
        const user = await exports.userService.findById(id);
        if (!user) {
            throw new Error('Failed to create user');
        }
        return user;
    },
    findById: async (id) => {
        const stmt = database_1.db.prepare('SELECT id, username, password FROM users WHERE id = ?');
        const result = stmt.get(id);
        return result || null;
    }
};
//# sourceMappingURL=userService.js.map