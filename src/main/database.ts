import Database, { type Database as SqliteDatabase } from 'better-sqlite3';
import { dbPath } from './constants';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Ensure the database directory exists
const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const db: SqliteDatabase = new Database(dbPath);

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
  `);

// Define the type for the column info
interface TableColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

// Function to add a column if it does not already exist
function addColumnIfNotExists(tableName: string, columnName: string, columnType: string, defaultValue?: string) {
  const tableInfo: TableColumnInfo[] = db.prepare(`PRAGMA table_info(${tableName})`).all() as unknown as TableColumnInfo[]; // Explicitly cast the result to TableColumnInfo[]
  const columns = tableInfo.map((col) => col.name);

  if (!columns.includes(columnName)) {
    let alterTableQuery = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`;
    if (defaultValue !== undefined && defaultValue !== 'CURRENT_TIMESTAMP') {
      alterTableQuery += ` DEFAULT ${defaultValue}`;
    }
    db.exec(alterTableQuery);

    if (columnType === 'TEXT' && defaultValue === 'CURRENT_TIMESTAMP') {
      db.exec(`UPDATE ${tableName} SET ${columnName} = CURRENT_TIMESTAMP`);
    }
  }
}

// Export the database instance and the function
export { db, addColumnIfNotExists };
