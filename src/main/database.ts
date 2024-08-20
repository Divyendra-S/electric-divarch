import Database from 'better-sqlite3'
import { dbPath } from './constants'
import { dirname } from 'path'
import { existsSync, mkdirSync } from 'fs'

// Ensure the database directory exists
const dir = dirname(dbPath)
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true })
}

const db = new Database(dbPath)

db.exec(`
    CREATE TABLE IF NOT EXISTS Folder (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  
    CREATE TABLE IF NOT EXISTS Bookmark (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      text TEXT NOT NULL,
      screenshot TEXT,
      tags TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      folderId INTEGER,
      aspectRatio INTEGER,
      FOREIGN KEY (folderId) REFERENCES Folder(id)
    );
  `)

// Function to add a column if it does not already exist
function addColumnIfNotExists(tableName, columnName, columnType, defaultValue) {
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all()
  const columns = tableInfo.map((col) => col.name)

  if (!columns.includes(columnName)) {
    let alterTableQuery = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`
    if (defaultValue !== undefined && defaultValue !== 'CURRENT_TIMESTAMP') {
      alterTableQuery += ` DEFAULT ${defaultValue}`
    }
    db.exec(alterTableQuery)

    if (columnType === 'TEXT' && defaultValue === 'CURRENT_TIMESTAMP') {
      db.exec(`UPDATE ${tableName} SET ${columnName} = CURRENT_TIMESTAMP`)
    }
  }
}

// Export the database instance and the function
export { db, addColumnIfNotExists }
