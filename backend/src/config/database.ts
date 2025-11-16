import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Use better-sqlite3 instead of pg pool
export const db: Database.Database = new Database(path.join(__dirname, '..', '..', 'clipboard.db'));

// Ensure proper UTF-8 handling
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA encoding = "UTF-8";');

// Initialize database tables if they don't exist
db.exec(`
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

// Test the connection
try {
  db.exec('SELECT 1');
  console.log('SQLite database connected successfully');
} catch (err) {
  console.error('SQLite database connection error:', err);
}