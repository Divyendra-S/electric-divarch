import { db } from './database'

export function getBookmarksByFolderId(folderId: number) {
  const stmt = db.prepare(`
    SELECT id, title, text, screenshot, tags, createdAt, folderId, aspectRatio
    FROM Bookmark
    WHERE folderId = ?
  `)
  return stmt.all(folderId)
}

export function deleteTag(bookmarkId: number, tagToDelete: string) {
  const stmt = db.prepare(`
    SELECT tags
    FROM Bookmark
    WHERE id = ?
  `)
  const bookmark: any = stmt.get(bookmarkId)

  if (!bookmark) {
    return { error: 'Bookmark not found' }
  }

  const updatedTags = bookmark.tags
    .split(',')
    .filter((tag: string) => tag.trim() !== tagToDelete)
    .join(',')

  const updateStmt = db.prepare(`
    UPDATE Bookmark
    SET tags = ?
    WHERE id = ?
  `)
  updateStmt.run(updatedTags, bookmarkId)

  return { success: true }
}

export function addTag(bookmarkId: number, newTag: string) {
  const stmt = db.prepare(`
      SELECT tags
      FROM Bookmark
      WHERE id = ?
    `)
  const bookmark: any = stmt.get(bookmarkId)

  if (!bookmark) {
    throw new Error('Bookmark not found')
  }

  const updatedTags = bookmark.tags ? `${bookmark.tags},${newTag}` : newTag

  const updateStmt = db.prepare(`
      UPDATE Bookmark
      SET tags = ?
      WHERE id = ?
    `)
  updateStmt.run(updatedTags, bookmarkId)

  return { success: true }
}

export function addBookmarkToFolder(bookmarkId: number, folderId: number) {
  const stmt = db.prepare(`
      UPDATE Bookmark
      SET folderId = ?
      WHERE id = ?
    `)
  stmt.run(folderId, bookmarkId)

  return { success: true }
}

export function deleteBookmark(bookmarkId: number) {
  const stmt = db.prepare(`
      DELETE FROM Bookmark
      WHERE id = ?
    `)
  stmt.run(bookmarkId)

  return { success: true }
}
export function getAllBookmarks() {
  const stmt = db.prepare(`
      SELECT Bookmark.*, Folder.name AS folderName
      FROM Bookmark
      LEFT JOIN Folder ON Bookmark.folderId = Folder.id
      ORDER BY Bookmark.createdAt DESC
    `)
  return stmt.all()
}
export async function  searchBookmarks(tagsToSearch: string) {
  const stmt = db.prepare(`
      SELECT Bookmark.*, Folder.name AS folderName
      FROM Bookmark
      LEFT JOIN Folder ON Bookmark.folderId = Folder.id
      WHERE Bookmark.tags LIKE '%' || ? || '%' OR Bookmark.text LIKE '%' || ? || '%'
    `)
  return stmt.all(tagsToSearch, tagsToSearch)
}
export function updateBookmark(bookmarkId: number, title?: string, text?: string) {
  const data: { title?: string; text?: string } = {}
  if (title) data.title = title
  if (text) data.text = text

  const stmt = db.prepare(`
      UPDATE Bookmark
      SET title = ?, text = ?
      WHERE id = ?
    `)
  stmt.run(data.title, data.text, bookmarkId)

  return { success: true }
}
// export async function createBookmark(url?: string, text?: string) {
//   if (!url) {
//     return { error: 'URL not provided' };
//   }

//   // Fetch HTML content (replace this with your actual implementation)
//   const html = await fetchHtml(url);

//   // Fetch OG image (screenshot)
//   const ogData = await fetchOgImageAndSave(url);

//   // Generate tags and title (replace this with your actual implementation)
//   const tagsRes = await analyzeContentAndURL(url, html);
//   const tags = tagsRes.tags;
//   const title = tagsRes.title;

//   if (!tags) {
//     console.log('No tags generated');
//     return { error: 'Failed to generate tags' };
//   }

//   const insertStmt = db.prepare(`
//     INSERT INTO Bookmark (title, text, screenshot, tags)
//     VALUES (?, ?, ?, ?)
//   `);
//   const info = insertStmt.run(title, text, ogData, tags.join(','));

//   return { success: { id: info.lastInsertRowid, title, tags } };
// }
