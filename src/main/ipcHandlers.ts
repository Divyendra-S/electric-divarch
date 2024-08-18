import { ipcMain, net } from 'electron'
import Groq from 'groq-sdk'
import { prisma } from './prisma'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
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
    const html = await fetchHtml(url);
    const options = { html, url };
    const data = await ogs(options);
    const { error, result } = data;

    if (error) {
      console.error('OGS Error:', result);
      throw new Error(result.error);
    }

    console.log('OGS Result:', result);

    // Extract the OG image URL
    const ogImageUrl = result.ogImage?.url;
    if (!ogImageUrl) {
      throw new Error('No OG image found');
    }

    // Fetch the OG image and convert it to base64
    const base64Image = await fetchImageAsBase64(ogImageUrl);

    // Save the base64 image in the database using Prisma
    // const savedImage = await prisma.image.create({
    //   data: {
    //     url,
    //     imageBase64: base64Image,
    //   },
    // });
    

    return base64Image;
  } catch (error) {
    console.error('Error fetching OG data:', error);
    throw error;
  }
}

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    let data = '';

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        resolve(data);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
}

function fetchImageAsBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = net.request(url);
    let chunks: Uint8Array[] = [];

    request.on('response', (response) => {
      response.on('data', (chunk) => {
        chunks.push(new Uint8Array(chunk));
      });
      response.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64Image = buffer.toString('base64');
        resolve(base64Image);
      });
    });

    request.on('error', (error) => {
      reject(error);
    });

    request.end();
  });
}

function truncateHtml(html: string, maxLength: number = 3000): string {
  if (html.length <= maxLength) return html
  return html.substring(0, maxLength) + '...'
}



export const setupIpcHandlers = () => {

  async function fetchOgImageAndSave(url: string) {
    try {
      const html = await fetchHtml(url);
      const options = { html, url };
      const data = await ogs(options);
      const { error, result } = data;
  
      if (error) {
        console.error('OGS Error:', result);
        throw new Error(result.error);
      }
  
      console.log('OGS Result:', result);
  
      // Check if ogImage exists and handle it as an array
      const ogImageUrl = result.ogImage?.[0]?.url;
      if (!ogImageUrl) {
        throw new Error('No OG image found');
      }
  
      // Fetch the OG image and convert it to base64
      const base64Image = await fetchImageAsBase64(ogImageUrl);
  
      // Save the base64 image in the database using Prisma
     
  
      return base64Image;
    } catch (error) {
      console.error('Error fetching OG data:', error);
      throw error;
    }
  }
  

  async function analyzeContentAndURL(
    url: string,
    html: string
  ): Promise<Schema> {
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

  // ipcMain.handle('create-bookmark', async (_, text: string) => {
  //   const tags = 'world'
  //   const userId = 'example22'
  //   try {
  //     const bookmark = await prisma.bookmark.create({
  //       data: {
  //         text,
  //         tags,
  //         userId
  //       }
  //     })
  //     return bookmark
  //   } catch (error) {
  //     console.error('Error creating bookmark:', error)
  //     return []
  //   }
  // })

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

  ipcMain.handle('fetch-all-folders-with-tags', async (_, userId: string) => {
    if (!userId) {
      return { error: 'Invalid user' }
    }
    try {
      return await prisma.folder.findMany({
        where: { userId },
        include: {
          bookmarks: {
            select: {
              tags: true,
              title: true,
              text: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching folders with tags:', error)
      return { error: 'Error fetching folders with tags' }
    }
  })

  ipcMain.handle('get-folders', async (_, userId: string) => {
    if (!userId) {
      return { error: 'Invalid user' }
    }
    try {
      const folders = await prisma.folder.findMany({
        where: { userId },
        select: { id: true, name: true, createdAt: true },
        orderBy: { name: 'asc' }
      })
      return folders
    } catch (error) {
      console.error('Error fetching folders:', error)
      return []
    }
  })

  ipcMain.handle('get-bookmarks-by-folder-id', async (_, folderId: number, userId: string) => {
    if (!userId) {
      return { error: 'Invalid user' }
    }
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { folderId, userId },
        select: {
          id: true,
          title: true,
          text: true,
          screenshot: true,
          tags: true,
          createdAt: true,
          folderId: true,
          userId: true,
          folder: true,
          aspectRatio: true
        }
      })
      return bookmarks
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      return []
    }
  })

  ipcMain.handle('get-folder-by-id', async (_, folderId: number) => {
    try {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { id: true, name: true, createdAt: true, userId: true }
      })
      return folder
    } catch (error) {
      console.error('Error fetching folder:', error)
      return null
    }
  })

  ipcMain.handle('update-folder-name', async (_, folderId: number, newName: string) => {
    try {
      const updatedFolder = await prisma.folder.update({
        where: { id: folderId },
        data: { name: newName }
      })
      return updatedFolder
    } catch (error) {
      console.error('Error updating folder name:', error)
      throw error
    }
  })

  ipcMain.handle('get-folders-with-first-bookmark', async (_, userId: string) => {
    if (!userId) {
      return { error: 'Invalid user' }
    }
    try {
      const folders = await prisma.folder.findMany({
        where: { userId },
        include: {
          bookmarks: {
            take: 1
          }
        }
      })

      return folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        firstBookmark: folder.bookmarks[0] || null
      }))
    } catch (error) {
      console.error('Error fetching folders with first bookmark:', error)
      return []
    }
  })

  ipcMain.handle('get-folder-by-bookmark-id', async (_, bookmarkId: number, userId: string) => {
    if (!userId) {
      return { error: 'Invalid user' }
    }
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: { id: bookmarkId },
        include: { folder: true }
      })
      return bookmark?.folder || null
    } catch (error) {
      console.error('Error fetching folder by bookmark id:', error)
      return null
    }
  })
  ipcMain.handle('delete-tag', async (_, bookmarkId: number, tagToDelete: string) => {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: { id: bookmarkId },
        select: { tags: true }
      })

      if (!bookmark) {
        return { error: 'Bookmark not found' }
      }

      const updatedTags = bookmark.tags
        .split(',')
        .filter((tag) => tag.trim() !== tagToDelete)
        .join(',')

      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: { tags: updatedTags }
      })

      return { success: true }
    } catch (error) {
      console.error('Error deleting tag:', error)
      return { error: 'Error in deleting tag' }
    }
  })

  ipcMain.handle(
    'create-folder-and-add-bookmarks',
    async (_, folderName: string, bookmarkIds: number[], userId: string) => {
      try {
        const alreadyExists = await prisma.folder.findFirst({
          where: {
            name: folderName,
            userId
          }
        })
        if (alreadyExists) {
          return { error: 'Folder already exists' }
        }
        const folder = await prisma.folder.create({
          data: {
            name: folderName,
            userId
          }
        })

        await prisma.bookmark.updateMany({
          where: {
            id: { in: bookmarkIds },
            userId
          },
          data: {
            folderId: folder.id
          }
        })

        return { success: folder }
      } catch (error) {
        console.error('Error creating folder and adding bookmarks:', error)
        return { error: 'Failed to create folder and add bookmarks' }
      }
    }
  )

  ipcMain.handle('create-folder', async (_, folderName: string, userId: string) => {
    if (!folderName) {
      return { error: 'Folder name is required' }
    }

    try {
      const alreadyExists = await prisma.folder.findFirst({
        where: {
          name: folderName,
          userId
        }
      })
      if (alreadyExists) {
        return { error: 'Folder already exists' }
      } else {
        const folder = await prisma.folder.create({
          data: {
            name: folderName,
            userId
          }
        })
        return { success: folder }
      }
    } catch (error) {
      return { error: 'Failed to create folder' }
    }
  })

  ipcMain.handle(
    'create-bookmark',
    async (_,  url?: string, Text?: string ) => {
      try{
        if (!url) {
          return { error: "URL not provided" };
        }
  
        // Fetch HTML content
        const html = await fetchHtml(url);
  
        // Fetch OG image (screenshot)
        const ogData = await fetchOgImageAndSave( url);
        console.log('Og image', ogData,'ogsoosso')
        
        // const options = { html, url }
        // const data = await ogs(options)
        // const { error, result } = data
  
        // if (error) {
        //   console.error('OGS Error:', result)
        //   throw new Error(result.error)
        // }
  
        // console.log('OGS Result:', result)
  
        // Generate tags and title
        const tagsRes = await analyzeContentAndURL(url,html);
        const tags = tagsRes.tags;
        const title = tagsRes.title;
  
        if (!tags) {
          console.log("No tags generated");
          return { error: "Failed to generate tags" };
        }
        console.log("From create-bookmark", tagsRes)
        console.log(tagsRes.tags)
        return tagsRes;
        
      } catch (error) {
        console.log(error);
        return { error: "Failed to create bookmark" };
      }
    }
  );
  

  ipcMain.handle('add-tag', async (_, bookmarkId: number, newTag: string) => {
    try {
      const bookmark = await prisma.bookmark.findUnique({
        where: { id: bookmarkId },
        select: { tags: true }
      })

      if (!bookmark) {
        throw new Error('Bookmark not found')
      }

      const updatedTags = bookmark.tags ? `${bookmark.tags},${newTag}` : newTag

      await prisma.bookmark.update({
        where: { id: bookmarkId },
        data: { tags: updatedTags }
      })

      return { success: true }
    } catch (error) {
      console.error('Error adding tag:', error)
      return { error: 'Failed to add tag' }
    }
  })

  ipcMain.handle(
    'update-bookmark',
    async (_, bookmarkId: number, title?: string, text?: string) => {
      try {
        const data: { title?: string; text?: string } = {}
        if (title) data.title = title
        if (text) data.text = text

        await prisma.bookmark.update({
          where: { id: bookmarkId },
          data
        })

        return { success: true }
      } catch (error) {
        console.error('Error updating bookmark:', error)
        return { error: 'Failed to update bookmark' }
      }
    }
  )

  ipcMain.handle(
    'add-bookmark-to-folder',
    async (_, bookmarkId: number, folderId: number, userId: string) => {
      try {
        await prisma.bookmark.update({
          where: { id: bookmarkId },
          data: { folderId: folderId }
        })
        return { success: true }
      } catch (error) {
        console.error('Error adding bookmark to folder:', error)
        return { success: false, error: 'Failed to add bookmark to folder' }
      }
    }
  )

  ipcMain.handle('delete-bookmark', async (_, bookmarkId: number) => {
    try {
      await prisma.bookmark.delete({
        where: { id: bookmarkId }
      })
      return { success: true }
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      return { success: false, error: 'Failed to delete bookmark' }
    }
  })

  ipcMain.handle('get-all-bookmarks', async (_, userId: string) => {
    try {
      const allBookmarksWithUserAndFolder = await prisma.bookmark.findMany({
        where: {
          userId
        },
        include: {
          folder: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      return allBookmarksWithUserAndFolder
    } catch (error) {
      console.error('Error fetching bookmarks with user and folder:', error)
      return { error: 'Failed to fetch bookmarks' }
    }
  })

  ipcMain.handle('search-bookmarks', async (_, tagsToSearch: string, userId: string) => {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        include: {
          folder: true
        },
        where: {
          userId,
          OR: [
            {
              tags: {
                contains: tagsToSearch,
                mode: 'insensitive'
              }
            },
            {
              text: {
                contains: tagsToSearch,
                mode: 'insensitive'
              }
            }
          ]
        }
      })
      return { success: bookmarks }
    } catch (error) {
      return { error: 'failed to search' }
    }
  })
}
