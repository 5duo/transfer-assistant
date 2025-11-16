import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

async function createTables() {
  try {
    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create clipboard_items table
    await db.exec(`
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

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_user_id ON clipboard_items(user_id);
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_is_guest ON clipboard_items(is_guest);
    `);

    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clipboard_items_created_at ON clipboard_items(created_at DESC);
    `);

    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createTables();
}

export { createTables };