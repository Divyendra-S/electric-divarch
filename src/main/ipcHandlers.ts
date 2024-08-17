// import { ipcMain } from 'electron'
// import Groq from 'groq-sdk'
// import { prisma } from './prisma'

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// interface Schema {
//   tags: string
//   title: string
// }

// const schema: Record<string, unknown> = {
//   properties: {
//     tags: { type: 'string' },
//     title: { type: 'string' }
//   },
//   required: ['tags', 'title'],
//   type: 'object'
// }

// export const setupIpcHandlers = () => {
//   ipcMain.handle('create-bookmark', async (_, text: string) => {
//     const tags = 'world'
//     const userId = 'example22'
//     try {
//       const bookmark = await prisma.bookmark.create({
//         data: {
//           text,
//           tags,
//           userId
//         }
//       })
//       return bookmark
//     } catch (error) {
//       console.error('Error creating bookmark:', error)
//       return []
//     }
//   })

//   ipcMain.handle('create-tags', async (_, url: string, html: string): Promise<Schema> => {
//     const prompt = `
//     Analyze the following HTML content and URL to generate relevant tags and a concise title. The content may be truncated.
//     URL: ${url}
//     HTML: ${html}
//     Task:
//     1. Title: Create a concise title (max 3 words) that accurately describes the main content.
//     2. Tags: Generate a comprehensive list of relevant tags. Consider:
//     - The website name and domain (extracted from the URL)
//     - Main topic and key concepts
//     - Potential user actions or intentions
//     - Search terms a user might use to find this content
//     3. Guidelines:
//     - Prioritize the main content over HTML structure or irrelevant page elements
//     - Don't include 'HTML', 'http', 'https', 'www','Google Search' or generic web terms as tags
//     - Focus searchable terms
//     - Include both broad categories and specific details
//     - Aim improve findability
//     Remember, the goal is to create tags that would help a user easily find and identify this bookmark in a large collection.
//     `
//     const jsonSchema = JSON.stringify(schema, null, 4)
//     const chat_completion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: 'system',
//           content: `You are an intelligent assistant that generates tags and concise titles based on given HTML content and URL. The JSON object must use the schema: ${jsonSchema}`
//         },
//         {
//           role: 'user',
//           content: prompt
//         }
//       ],
//       model: 'llama3-70b-8192',
//       temperature: 0,
//       stream: false,
//       response_format: { type: 'json_object' }
//     })
//     const content = chat_completion.choices[0].message.content
//     if (!content) {
//       throw new Error('Received null or undefined content from chat completion')
//     }
//     const result: Schema = JSON.parse(content)
//     return result
//   })
//   ipcMain.handle('fetch-ogimage', async (_, url: string) => {
//     const ogs = require('open-graph-scraper-lite');
//     const options = { url: 'https://www.prisma.io/docs/orm/prisma-schema/data-model/models' };
    
//     try {
//         const data = await ogs(options);
//         const { error, result, response } = data;
//         console.log('error:', error);
//         console.log('result:', result);
//         console.log('response:', response);
        
//         return result; // Return the result to the renderer process
//     } catch (error) {
//         console.error('Error fetching OG data:', error);
//         throw error; // Re-throw the error to be handled by Electron
//     }
// });
// }
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
function truncateHtml(html: string, maxLength: number = 3000): string {
  if (html.length <= maxLength) return html;
  return html.substring(0, maxLength) + '...';
}

export const setupIpcHandlers = () => {
  ipcMain.handle('create-bookmark', async (_, text: string) => {
    const tags = 'world'
    const userId = 'example22'
    try {
      const bookmark = await prisma.bookmark.create({
        data: {
          text,
          tags,
          userId
        }
      })
      return bookmark
    } catch (error) {
      console.error('Error creating bookmark:', error)
      return []
    }
  })

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
}