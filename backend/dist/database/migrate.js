"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTables = createTables;
const database_1 = require("../config/database");
async function createTables() {
    try {
        await database_1.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await database_1.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_items (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        content TEXT NOT NULL,
        type TEXT CHECK (type IN ('text', 'file')) NOT NULL,
        file_name TEXT,
        mime_type TEXT,
        is_guest BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await database_1.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
    `);
        await database_1.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_is_guest ON clipboard_items(is_guest);
    `);
        await database_1.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at DESC);
    `);
        console.log('Database tables created successfully');
    }
    catch (err) {
        console.error('Error creating database tables:', err);
    }
}
if (require.main === module) {
    createTables();
}
//# sourceMappingURL=migrate.js.map