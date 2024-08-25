import { db } from './database';

interface Folder {
  id: number;
  name: string;
  createdAt: string;
}

interface FolderWithFirstBookmark extends Folder {
  firstBookmarkId: number | null;
  firstBookmark: { id: number } | null;
}

export function fetchAllFoldersWithTags() {
  const stmt = db.prepare(`
    SELECT Folder.id, Folder.name, Folder.createdAt, 
           Bookmark.title, Bookmark.text, Bookmark.tags
    FROM Folder
    LEFT JOIN Bookmark ON Folder.id = Bookmark.folderId
  `);
  return stmt.all();
}

export function getFolders(): any {
  const stmt = db.prepare(`
    SELECT id, name, createdAt
    FROM Folder
    ORDER BY name ASC
  `);
  return stmt.all();
}

export function getFolderById(folderId: number):any{
  const stmt = db.prepare(`
    SELECT id, name, createdAt
    FROM Folder
    WHERE id = ?
  `);
  return stmt.get(folderId);
}

export function updateFolderName(folderId: number, newName: string): { success: boolean } {
  const stmt = db.prepare(`
    UPDATE Folder
    SET name = ?
    WHERE id = ?
  `);
  stmt.run(newName, folderId);
  return { success: true };
}

export function getFoldersWithFirstBookmark(): FolderWithFirstBookmark[] {
  const stmt = db.prepare(`
    SELECT Folder.id, Folder.name, Folder.createdAt,
           (SELECT Bookmark.id FROM Bookmark WHERE Bookmark.folderId = Folder.id LIMIT 1) AS firstBookmarkId
    FROM Folder
  `);
  const folders:any = stmt.all();
  return folders.map((folder) => ({
    ...folder,
    firstBookmark: folder.firstBookmarkId ? { id: folder.firstBookmarkId } : null,
  }));
}

export function createFolder(folderName: string): { success?: { id: number; name: string }; error?: string } {
  const checkStmt = db.prepare(`
    SELECT id
    FROM Folder
    WHERE name = ?
  `);
  const existingFolder = checkStmt.get(folderName);

  if (existingFolder) {
    return { error: 'Folder already exists' };
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO Folder (name)
      VALUES (?)
    `);
    const info = insertStmt.run(folderName);
    return { success: { id: info.lastInsertRowid as number, name: folderName } };
  }
}

export function createFolderAndAddBookmarks(folderName: string, bookmarkIds: number[]): { success?: boolean; error?: string } {
  const checkStmt = db.prepare(`
    SELECT id
    FROM Folder
    WHERE name = ?
  `);
  const existingFolder = checkStmt.get(folderName);

  if (existingFolder) {
    return { error: 'Folder already exists' };
  }

  const insertStmt = db.prepare(`
    INSERT INTO Folder (name)
    VALUES (?)
  `);
  const info = insertStmt.run(folderName);
  const folderId = info.lastInsertRowid;

  const updateStmt = db.prepare(`
    UPDATE Bookmark
    SET folderId = ?
    WHERE id IN (${bookmarkIds.map(() => '?').join(',')})
  `);
  updateStmt.run(folderId, ...bookmarkIds);

  return { success: true };
}

export function getFolderByBookmarkId(bookmarkId: number):any {
  const stmt = db.prepare(`
    SELECT Folder.id, Folder.name, Folder.createdAt
    FROM Folder
    JOIN Bookmark ON Folder.id = Bookmark.folderId
    WHERE Bookmark.id = ?
  `);
  return stmt.get(bookmarkId);
}
