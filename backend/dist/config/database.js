"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.db = new better_sqlite3_1.default(path_1.default.join(__dirname, '..', '..', 'clipboard.db'));
exports.db.exec('PRAGMA journal_mode = WAL;');
exports.db.exec('PRAGMA encoding = "UTF-8";');
exports.db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

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

  CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
  CREATE INDEX IF NOT EXISTS idx_clipboard_items_is_guest ON clipboard_items(is_guest);
  CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at DESC);
`);
try {
    exports.db.exec('SELECT 1');
    console.log('SQLite database connected successfully');
}
catch (err) {
    console.error('SQLite database connection error:', err);
}
//# sourceMappingURL=database.js.map