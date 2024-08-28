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

export function getFoldersWithFirstBookmark() {
  const foldersStmt = db.prepare(`
    SELECT id, name, createdAt
    FROM Folder
    ORDER BY id
  `);
  const folders:any = foldersStmt.all();

  // Then, for each folder, get the first bookmark (if any)
  const firstBookmarkStmt = db.prepare(`
    SELECT id, title, text, screenshot, tags, createdAt, folderId, aspectRatio
    FROM Bookmark
    WHERE folderId = ?
    ORDER BY id
    LIMIT 1
  `);

  return folders.map(folder => {
    const firstBookmark = firstBookmarkStmt.get(folder.id);
    return {
      id: folder.id,
      name: folder.name,
      createdAt: folder.createdAt,
      firstBookmark: firstBookmark || null
    };
  });
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
