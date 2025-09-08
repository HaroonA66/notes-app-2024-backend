import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

const connectDB = async () => {
  try {
    // Create or connect to SQLite database
    const dbPath = path.join(__dirname, 'notes.db');
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Create notes table if it doesn't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        status TEXT DEFAULT '' CHECK (status IN ('trash', 'deleted', '')),
        edit_date TEXT,
        create_date TEXT,
        color TEXT
      )
    `);
    
    console.log('Connected to SQLite database:', dbPath);
    
  } catch (error) {
    console.error('Error connecting to SQLite database:', error);
    process.exit(1);
  }
};

// Get database instance
const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export default connectDB;
export { getDB };
