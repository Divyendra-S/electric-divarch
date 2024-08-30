import { BrowserWindow, ipcMain, net } from 'electron'
import Groq from 'groq-sdk'
import {
  createFolder,
  createFolderAndAddBookmarks,
  fetchAllFoldersWithTags,
  getFolderByBookmarkId,
  getFolderById,
  getFolders,
  getFoldersWithFirstBookmark,
  updateFolderName
} from './folderOperations'
import {
  addBookmarkToFolder,
  addTag,
  deleteBookmark,
  deleteTag,
  getAllBookmarks,
  getBookmarksByFolderId,
  searchBookmarks,
  updateBookmark
} from './bookmarkOperations'
import { db } from './database'



const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY });

const ogs = require('open-graph-scraper-lite')

interface Schema {
  tags: string
  title: string
}

const schema: Record<string, unknown> = {
  properties: {
    tags: { type: 'string' },
    title: { type: 'string' }
  },
  required: ['tags', 'title'],
  type: 'object'
}

interface FolderSchema {
  folderName: string | false
}

// Define the schema
const folderSchema: Record<string, unknown> = {
  properties: {
    folderName: { type: ['string', 'boolean'] }
  },
  required: ['folderName'],
  type: 'object'
}

// function fetchHtml(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const request = net.request(url)
//     let data = ''

//     request.on('response', (response) => {
//       response.on('data', (chunk) => {
//         data += chunk
//       })
//       response.on('end', () => {
//         resolve(data)
//       })
//     })

//     request.on('error', (error) => {
//       reject(error)
//     })

//     request.end()
//   })
// }
async function fetchOgImageAndSave(url: string) {
  try {
    const html = await fetchHtml(url)
    const options = { html, url }
    const data = await ogs(options)
    const { error, result } = data

    if (error) {
      console.error('OGS Error:', result)
      throw new Error(result.error)
    }

    console.log('OGS Result:', result)

    // Extract the OG image URL
    const ogImageUrl = result.ogImage?.url
    if (!ogImageUrl) {
      throw new Error('No OG image found')
    }

    // Fetch the OG image and convert it to base64
    const base64Image = await fetchImageAsBase64(ogImageUrl)

    // Save the base64 image in the database using Prisma
    // const savedImage = await prisma.image.create({
    //   data: {
    //     url,
    //     imageBase64: base64Image,
    //   },
    // });

    return base64Image
  } catch (error) {
    console.error('Error fetching OG data:', error)
    throw error
  }
}

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    let data = ''

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        data += chunk
      })
      response.on('end', () => {
        resolve(data)
      })
    })

    request.on('error', (error) => {
      reject(error)
    })

    request.end()
  })
}

function fetchImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request(url)
    let chunks: Uint8Array[] = []

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        chunks.push(new Uint8Array(chunk))
      })
      response.on('end', () => {
        const buffer = Buffer.concat(chunks)
        const base64Image = buffer.toString('base64')
        resolve(base64Image)
      })
    })

    request.on('error', (error) => {
      reject(error)
    })

    request.end()
  })
}



function truncateHtml(html: string, maxLength: number = 1000): string {
  if (html.length <= maxLength) return html
  return html.substring(0, maxLength) + '...'
}

export const setupIpcHandlers = (mainWindow) => {
  
  async function fetchHtmlWithWindow(url: string): Promise<string> {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      show: false, // Hide the window
    });
  
    await win.loadURL(url);
  
    // Get the HTML content of the page
    const html = await win.webContents.executeJavaScript('document.documentElement.outerHTML');
  
    // Clean up the BrowserWindow
    win.close();
  
    return html;
  }
  async function captureScreenshotAsBase64(url: string): Promise<string> {
    const win = new BrowserWindow({
      width: 1280,
      height: 800,
      show: false,
    });
  
    await win.loadURL(url);
  
    // Capture the screenshot
    const screenshot = await win.webContents.capturePage();
  
    // Convert the screenshot to a base64 string
    const base64Image = screenshot.toDataURL().split(',')[1];
  
    win.close();
  
    return base64Image;
  }

  async function fetchOgImageAndSave(url: string) {
    try {
      let html;
    try {
      html = await fetchHtml(url);
    } catch (netError) {
      console.warn('Failed to fetch HTML with net.request, falling back to BrowserWindow:', netError);
      html = await fetchHtmlWithWindow(url);
    }
      const options = { html, url }
      const data = await ogs(options)
      const { error, result } = data

      if (error) {
        console.error('OGS Error:', result)
        throw new Error(result.error)
      }

      console.log('OGS Result:', result)

      // Check if ogImage exists and handle it as an array
      const ogImageUrl = result?.ogImage?.[0]?.url
      
let base64Image
      // Fetch the OG image and convert it to base64
      if (ogImageUrl) {
        // Fetch the OG image and convert it to base64
        base64Image = await fetchImageAsBase64(ogImageUrl);
      } else {
        // If no OG image, capture a screenshot of the webpage
        base64Image = await captureScreenshotAsBase64(url);
      }

      // Save the base64 image in the database using Prisma

      return base64Image
    } catch (error) {
      console.error('Error fetching OG data:', error)
      throw error
    }
  }

  async function analyzeContentAndURL(url: string): Promise<Schema> {
    const fullHtml = await fetchHtml(url)
    const truncatedHtml = truncateHtml(fullHtml)

    const prompt = `
      Analyze the following HTML content and URL to generate relevant tags and a concise title. The content is truncated.
      URL: ${url}
      HTML: ${truncatedHtml}
      Task:
      1. Title: Create a concise title (max 3 words) that accurately describes the main content.
      2. Tags: Generate a comprehensive list of relevant tags. Consider:
      - The website name and domain (extracted from the URL)
      - Main topic and key concepts
      - Potential user actions or intentions
      - Search terms a user might use to find this content
      3. Guidelines:
      - Prioritize the main content over HTML structure or irrelevant page elements
      - Don't include 'HTML', 'http', 'https', 'www','Google Search' or generic web terms as tags
      - Focus on searchable terms
      - Include both broad categories and specific details
      - Aim to improve findability
      Remember, the goal is to create tags that would help a user easily find and identify this bookmark in a large collection.
      `
    const jsonSchema = JSON.stringify(schema, null, 4)
    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an intelligent assistant that generates tags and concise titles based on given HTML content and URL. The JSON object must use the schema: ${jsonSchema}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0,
      stream: false,
      response_format: { type: 'json_object' }
    })
    const content = chat_completion.choices[0].message.content
    if (!content) {
      throw new Error('Received null or undefined content from chat completion')
    }
    const result: Schema = JSON.parse(content)
    console.log(result)
    return result
  }

  async function findSuitableFolder(
    folders: any[],
    newTags: string,
    url: string
  ): Promise<string | false> {
    const prompt = `
  Here are the existing folders and their tags: ${JSON.stringify(folders)}.
  Here are the tags for a new bookmark: ${newTags}.
  Here is the URL for the new bookmark: ${url}
  Task:
  1. Determine if the new bookmark fits into any of the existing folders based on their tags and names.
  2. If it fits, return the name of the folder. If not, return false.
  3. If it doesn't fit return false, it's not necessary to return a folder name

  Guidelines:
  - Match the new bookmark to folders that broadly cover the relevant tags.
  - Avoid assigning the bookmark to a folder based on a single minor match.
  - Consider the broader topic that the tags imply and see if it fits within any folder's scope.
  - Check if the folder names themselves align with the new bookmark's tags.
  - Return the name of the matching folder or false if no appropriate folder is found.
  - Ensure to prioritize accurate and relevant folder matching to maintain proper organization.
  - Check if the URL matches the text in the existing folder or name of the existing folder not word to word but like main The website name and domain, don't consider 'https://www.' while checking (extracted from the ${url})
  - In whichever folder most things match, save the bookmark to that folder but remember if not much information matches return false
  - Don't match just because both are Google search but get the context this was an example
  `

    const jsonSchema = JSON.stringify(folderSchema, null, 4)

    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an intelligent assistant determining the appropriate folder for new bookmarks based on tags and folder names. The JSON object must use the schema: ${jsonSchema}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192', // Ensure this is the correct model name
      temperature: 0,
      stream: false,
      response_format: { type: 'json_object' }
    })

    const content = chat_completion.choices[0].message.content
    if (!content) {
      throw new Error('Received null or undefined content from chat completion')
    }

    const result: FolderSchema = JSON.parse(content)
    return result.folderName
  }
  async function findSuitableFolderForText(folders: any[], text: string): Promise<string | false> {
    const prompt = `
  Here are the existing folders and their tags: ${JSON.stringify(folders)}.
  Here is the text for a new bookmark: ${text}.
  Task: Determine if the new bookmark fits into any existing folder based on their tags and names.
  Guidelines:
  - Match the new bookmark to folders that broadly cover the relevant tags.
  - Avoid assigning the bookmark to a folder based on a single minor match.
  - Consider the broader topic that the text implies and see if it fits within any folder's scope.
  - Check if the folder names themselves align with the new bookmark's text.
  - Return the name of the matching folder or false if no appropriate folder is found.
  - Ensure to prioritize accurate and relevant folder matching to maintain proper organization.
  `

    const jsonSchema = JSON.stringify(folderSchema, null, 4)

    const chat_completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an intelligent assistant determining the appropriate folder for new bookmarks based on text and folder names. The JSON object must use the schema: ${jsonSchema}`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192', // Ensure this is the correct model name
      temperature: 0,
      stream: false,
      response_format: { type: 'json_object' }
    })

    const content = chat_completion.choices[0].message.content
    if (!content) {
      throw new Error('Received null or undefined content from chat completion')
    }

    const result: FolderSchema = JSON.parse(content)
    return result.folderName
  }

  ipcMain.handle('create-tags', async (_, url: string): Promise<Schema> => {
    try {
      const fullHtml = await fetchHtml(url)
      const truncatedHtml = truncateHtml(fullHtml)

      const prompt = `
      Analyze the following HTML content and URL to generate relevant tags and a concise title. The content is truncated.
      URL: ${url}
      HTML: ${truncatedHtml}
      Task:
      1. Title: Create a concise title (max 3 words) that accurately describes the main content.
      2. Tags: Generate a comprehensive list of relevant tags. Consider:
      - The website name and domain (extracted from the URL)
      - Main topic and key concepts
      - Potential user actions or intentions
      - Search terms a user might use to find this content
      3. Guidelines:
      - Prioritize the main content over HTML structure or irrelevant page elements
      - Don't include 'HTML', 'http', 'https', 'www','Google Search' or generic web terms as tags
      - Focus on searchable terms
      - Include both broad categories and specific details
      - Aim to improve findability
      Remember, the goal is to create tags that would help a user easily find and identify this bookmark in a large collection.
      `
      const jsonSchema = JSON.stringify(schema, null, 4)
      const chat_completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an intelligent assistant that generates tags and concise titles based on given HTML content and URL. The JSON object must use the schema: ${jsonSchema}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama3-70b-8192',
        temperature: 0,
        stream: false,
        response_format: { type: 'json_object' }
      })
      const content = chat_completion.choices[0].message.content
      if (!content) {
        throw new Error('Received null or undefined content from chat completion')
      }
      const result: Schema = JSON.parse(content)
      console.log(result)
      return result
    } catch (error) {
      console.error('Error in create-tags:', error)
      throw error
    }
  })
  ipcMain.handle(
    'find-suitable-folder',
    async (_, folders: any[], newTags: string, url: string): Promise<string | false> => {
      const prompt = `
    Here are the existing folders and their tags: ${JSON.stringify(folders)}.
    Here are the tags for a new bookmark: ${newTags}.
    Here is the URL for the new bookmark: ${url}
    Task:
    1. Determine if the new bookmark fits into any of the existing folders based on their tags and names.
    2. If it fits, return the name of the folder. If not, return false.
    3. If it doesn't fit return false, it's not necessary to return a folder name

    Guidelines:
    - Match the new bookmark to folders that broadly cover the relevant tags.
    - Avoid assigning the bookmark to a folder based on a single minor match.
    - Consider the broader topic that the tags imply and see if it fits within any folder's scope.
    - Check if the folder names themselves align with the new bookmark's tags.
    - Return the name of the matching folder or false if no appropriate folder is found.
    - Ensure to prioritize accurate and relevant folder matching to maintain proper organization.
    - Check if the URL matches the text in the existing folder or name of the existing folder not word to word but like main The website name and domain, dont consider 'https://www.' while checking (extracted from the ${url})
    - in whichever folder most things match save the bookmark to that folder but remember if not much information matches return false
    - dont match just because both are google search but get the context this was an example
  `

      const jsonSchema = JSON.stringify(folderSchema, null, 4)

      const chat_completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an intelligent assistant determining the appropriate folder for new bookmarks based on tags and folder names. The JSON object must use the schema: ${jsonSchema}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama3-70b-8192',
        temperature: 0,
        stream: false,
        response_format: { type: 'json_object' }
      })

      const content = chat_completion.choices[0].message.content
      if (!content) {
        throw new Error('Received null or undefined content from chat completion')
      }

      const result: FolderSchema = JSON.parse(content)
      return result.folderName
    }
  )

  ipcMain.handle(
    'find-suitable-folder-for-text',
    async (_, folders: any[], text: string): Promise<string | false> => {
      const prompt = `
    Here are the existing folders and their tags: ${JSON.stringify(folders)}.
    Here is the text for a new bookmark: ${text}.
    Task: Determine if the new bookmark fits into any existing folder based on their tags and names.
    Guidelines:
    - Match the new bookmark to folders that broadly cover the relevant tags.
    - Avoid assigning the bookmark to a folder based on a single minor match.
    - Consider the broader topic that the text implies and see if it fits within any folder's scope.
    - Check if the folder names themselves align with the new bookmark's text.
    - Return the name of the matching folder or false if no appropriate folder is found.
    - Ensure to prioritize accurate and relevant folder matching to maintain proper organization.
  `

      const jsonSchema = JSON.stringify(folderSchema, null, 4)

      const chat_completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are an intelligent assistant determining the appropriate folder for new bookmarks based on text and folder names. The JSON object must use the schema: ${jsonSchema}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama3-70b-8192', // Ensure you have the correct model name here
        temperature: 0,
        stream: false,
        response_format: { type: 'json_object' }
      })

      const content = chat_completion.choices[0].message.content
      if (!content) {
        throw new Error('Received null or undefined content from chat completion')
      }

      const result: FolderSchema = JSON.parse(content)
      return result.folderName
    }
  )

  ipcMain.handle('fetch-ogimage', async (_, url: string) => {
    try {
      const html = await fetchHtml(url)
      const options = { html, url }
      const data = await ogs(options)
      const { error, result } = data

      if (error) {
        console.error('OGS Error:', result)
        throw new Error(result.error)
      }

      console.log('OGS Result:', result)
      return result
    } catch (error) {
      console.error('Error fetching OG data:', error)
      throw error
    }
  })

  ipcMain.handle('fetch-all-folders-with-tags', async () => {
    try {
      return fetchAllFoldersWithTags()
    } catch (error) {
      console.error('Error fetching folders with tags:', error)
      return { error: 'Error fetching folders with tags' }
    }
  })

  ipcMain.handle('get-folders', async () => {
    try {
      return getFolders()
    } catch (error) {
      console.error('Error fetching folders:', error)
      return []
    }
  })

  ipcMain.handle('get-folder-by-id', async (_, folderId: number) => {
    try {
      return getFolderById(folderId)
    } catch (error) {
      console.error('Error fetching folder:', error)
      return null
    }
  })

  ipcMain.handle('update-folder-name', async (_, folderId: number, newName: string) => {
    try {
      return updateFolderName(folderId, newName)
    } catch (error) {
      console.error('Error updating folder name:', error)
      throw error
    }
  })

  ipcMain.handle('get-folders-with-first-bookmark', async () => {
    try {
      return getFoldersWithFirstBookmark()
    } catch (error) {
      console.error('Error fetching folders with first bookmark:', error)
      return []
    }
  })

  ipcMain.handle('create-folder', async (_, folderName: string) => {
    try {
      return createFolder(folderName)
    } catch (error) {
      return { error: 'Failed to create folder' }
    }
  })

  ipcMain.handle(
    'create-folder-and-add-bookmarks',
    async (_, folderName: string, bookmarkIds: number[]) => {
      try {
        const createdFolderAndAddBookmarks = createFolderAndAddBookmarks(folderName, bookmarkIds)
        mainWindow.webContents.send("bookmark-changed");
        return createdFolderAndAddBookmarks
      } catch (error) {
        console.error('Error creating folder and adding bookmarks:', error)
        return { error: 'Failed to create folder and add bookmarks' }
      }
    }
  )

  ipcMain.handle('get-folder-by-bookmark-id', async (_, bookmarkId: number) => {
    try {
      return getFolderByBookmarkId(bookmarkId)
    } catch (error) {
      console.error('Error fetching folder by bookmark id:', error)
      return {error:'Error fetching folder'}
    }
  })

  ipcMain.handle('get-bookmarks-by-folder-id', async (_, folderId: number) => {
    try {
      return getBookmarksByFolderId(folderId)
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      return {error:'Error fetching bookmarks'}
    }
  })

  ipcMain.handle('delete-tag', async (_, bookmarkId: number, tagToDelete: string) => {
    try {
      const deletedTag = deleteTag(bookmarkId, tagToDelete)
      mainWindow.webContents.send("bookmark-changed"); 
      return deletedTag
    } catch (error) {
      console.error('Error deleting tag:', error)
      return { error: 'Error in deleting tag' }
    }
  })

  ipcMain.handle('create-bookmark-with-screenshot', async (_, url?: string) => {
    try {
      if (!url) {
        return { error: 'URL not provided' }
      }

      // Fetch HTML content
      // const html = await fetchHtml(url)

      // Fetch OG image (screenshot)
      const ogData = await fetchOgImageAndSave(url)
      // console.log('Og image', ogData, 'ogsoosso')

      // const options = { html, url }
      // const data = await ogs(options)
      // const { error, result } = data

      // if (error) {
      //   console.error('OGS Error:', result)
      //   throw new Error(result.error)
      // }

      // console.log('OGS Result:', result)

      // Generate tags and title
      const tagsRes = await analyzeContentAndURL(url)
      const tags = tagsRes.tags
      const title = tagsRes.title

      if (!tags) {
        console.log('No tags generated')
        return { error: 'Failed to generate tags' }
      }
    const folders = await fetchAllFoldersWithTags();
    if ("error" in folders) {
      console.error("Error fetching folders:", folders.error);
      return { error: "Failed to fetch folders" };
    }

      const suitableFolderName = await findSuitableFolder(folders, tags, url);

      let folder
      if (suitableFolderName) {
         folder = db.prepare('SELECT * FROM folder WHERE name = ? LIMIT 1').get(suitableFolderName);
      }
      if (!folder) {
        const insertBookmark = db.prepare(`
          INSERT INTO bookmark (title, text, tags, screenshot)
          VALUES (?, ?, ?, ?)
        `);
        insertBookmark.run(title, url, tags, ogData);
      
        console.log(
          "folder not found so bookmark created successfully without connecting to any folder"
        );
        mainWindow.webContents.send("bookmark-changed");
        return {
          message:
            "bookmark created successfully!!! without connecting to any folder",
        };
      }

      const insertBookmark = db.prepare(`
        INSERT INTO bookmark (title, text, tags, screenshot, folderId)
        VALUES (?, ?, ?, ?, ?)
      `);
      insertBookmark.run(title, url, tags, ogData, folder.id);
      
      console.log("success");
      mainWindow.webContents.send("bookmark-changed");
      return {
        message: "bookmark created successfully and added to suitable folder",
      };
      
      
    } catch (error) {
      console.log(error)
      return { error: 'Failed to create bookmark' }
    }
  })

  ipcMain.handle('create-bookmark', async (_, text: string) => {
    const tags = text // You might want to make this dynamic

    try {
      const stmt = db.prepare(`
        INSERT INTO Bookmark (text, tags)
        VALUES (?, ?)
      `)

      const result = stmt.run(text, tags)

      if (result.changes > 0) {
        // Fetch the created bookmark
        const getBookmark = db.prepare('SELECT * FROM Bookmark WHERE id = ?')
        const bookmark = getBookmark.get(result.lastInsertRowid)
        // console.log(bookmark)  
        mainWindow.webContents.send("bookmark-changed");
        return {message: "bookmark created successfully"}
      } else {
        throw new Error('Failed to create bookmark')
      }
    } catch (error) {
      console.error('Error creating bookmark:', error)
      return {error: "Failed to create bookmark"}
    }
  })
  ipcMain.handle('add-tag', async (_, bookmarkId: number, newTag: string) => {
    try {
      
       const addTags=addTag(bookmarkId, newTag)

      mainWindow.webContents.send("bookmark-changed"); 
      return addTags
    } catch (error) {
      console.error('Error adding tag:', error)
      return { error: 'Error in adding tag' }
    }
  })

  ipcMain.handle(
    'update-bookmark',
    async (_, bookmarkId: number, title?: string, text?: string) => {
      try {
        const updatedBookmark = updateBookmark(bookmarkId, title, text)
        mainWindow.webContents.send("bookmark-changed"); 
        return updatedBookmark
      } catch (error) {
        console.error('Error updating bookmark:', error)
        return { error: 'Failed to update bookmark' }
      }
    }
  )

  ipcMain.handle('add-bookmark-to-folder', async (_, bookmarkId: number, folderId: number) => {
    try {
      const addedBookmark = addBookmarkToFolder(bookmarkId, folderId)
      mainWindow.webContents.send("bookmark-changed"); 
      return addedBookmark
    } catch (error) {
      console.error('Error adding bookmark to folder:', error)
      return { error: 'Failed to add bookmark to folder' }
    }
  })

  ipcMain.handle('delete-bookmark', async (_, bookmarkId: number) => {
    try {
      const deletedBookmark = deleteBookmark(bookmarkId)
      mainWindow.webContents.send("bookmark-changed"); 
      return deletedBookmark
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      return { error: 'Failed to delete bookmark' }
    }
  })

  ipcMain.handle('get-all-bookmarks', async () => {
    try {
      const bookmarkss = await getAllBookmarks();
      // console.log(bookmarkss,"bookmarksssososos")
      return bookmarkss
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }
  })

  ipcMain.handle('search-bookmarks', async (_, tagsToSearch: string) => {
    try {
      const bookmarks = await searchBookmarks(tagsToSearch)
      return {success: bookmarks}
    } catch (error) {
      console.error('Error searching bookmarks:', error)
      return { error: 'Failed to search'}
    }
  })
}

// import { net, BrowserWindow } from 'electron';
// import ogs from 'open-graph-scraper';
// import prisma from './prisma'; // Adjust the import according to your project structure
// import path from 'path';
// import fs from 'fs';

// async function fetchOgImageAndSave(url: string) {
//   try {
//     const html = await fetchHtml(url);
//     const options = { html, url };
//     const data = await ogs(options);
//     const { error, result } = data;

//     if (error) {
//       console.error('OGS Error:', result);
//       throw new Error(result.error);
//     }

//     console.log('OGS Result:', result);

//     // Check if ogImage exists and handle it as an array
//     let ogImageUrl = result.ogImage?.[0]?.url;
//     let base64Image;

//     if (ogImageUrl) {
//       // Fetch the OG image and convert it to base64
//       base64Image = await fetchImageAsBase64(ogImageUrl);
//     } else {
//       // If no OG image, capture a screenshot of the webpage
//       base64Image = await captureScreenshotAsBase64(url);
//     }

//     // Save the base64 image in the database using Prisma
//     const savedImage = await prisma.image.create({
//       data: {
//         url,
//         imageBase64: base64Image,
//       },
//     });

//     return savedImage;
//   } catch (error) {
//     console.error('Error fetching OG data:', error);
//     throw error;
//   }
// }

// function fetchHtml(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const request = net.request(url);
//     let data = '';

//     request.on('response', (response) => {
//       response.on('data', (chunk) => {
//         data += chunk;
//       });
//       response.on('end', () => {
//         resolve(data);
//       });
//     });

//     request.on('error', (error) => {
//       reject(error);
//     });

//     request.end();
//   });
// }

// function fetchImageAsBase64(url: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const request = net.request(url);
//     let chunks: Uint8Array[] = [];

//     request.on('response', (response) => {
//       response.on('data', (chunk) => {
//         chunks.push(new Uint8Array(chunk));
//       });
//       response.on('end', () => {
//         const buffer = Buffer.concat(chunks);
//         const base64Image = buffer.toString('base64');
//         resolve(base64Image);
//       });
//     });

//     request.on('error', (error) => {
//       reject(error);
//     });

//     request.end();
//   });
// }

// async function captureScreenshotAsBase64(url: string): Promise<string> {
//   // Create a hidden BrowserWindow to capture the screenshot
//   const win = new BrowserWindow({
//     width: 1280,
//     height: 800,
//     show: false,
//   });

//   await win.loadURL(url);

//   // Capture the screenshot
//   const screenshot = await win.webContents.capturePage();

//   // Convert the screenshot to a base64 string
//   const base64Image = screenshot.toDataURL().split(',')[1];

//   // Clean up the BrowserWindow
//   win.close();

//   return base64Image;
// }

// export default fetchOgImageAndSave
