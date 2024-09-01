# electric-mark

An Electron application with React and TypeScript

# electric-divarch

## About the Application

This is a **smart bookmark manager** where you can save web pages as bookmarks simply by providing the link. The application automatically generates relevant tags for each web page, making it easier to search and organize your bookmarks.

### Smart Spaces

- **Smart Spaces** are a key feature of this application. Users don't need to manually manage their Smart Spaces. When a new bookmark is added, it is automatically placed into the appropriate Smart Space based on its tags and content.
  
- For example, if a user has a Smart Space called "Shoes" where they store bookmarks related to different types of shoes, any new bookmark related to shoes will be automatically added to the "Shoes" Smart Space.

### How It Works

To achieve this level of automation, the application uses the **GROQ SDK** to access large language models (LLMs) that help in understanding and categorizing the content of bookmarks effectively.


## Demo of the application
1.
- When adding a new bookmark, the system:
  - Automatically places it into the most appropriate existing space if a similar smart space is found.
  - if not then it saves it without connecting to any space.
  - Determines suitability based on the similarity of the new bookmark's tags or content to the bookmarks already in that smart space.


https://github.com/user-attachments/assets/c613e85a-428e-4a94-84b7-25ab8a941d3e


2.
- In this demo, I am showcasing how a user can create a **Smart Space** by searching for bookmarks.
- Since it is a Smart Space, the user won’t need to manually manage it.
- Any new bookmark that is related to the tags of existing bookmarks within this Smart Space will automatically be saved there.
- The demo also covers how to delete a bookmark from the Smart Space.



https://github.com/user-attachments/assets/58b34914-d36f-455b-bab5-abc39441f4c1


3.
- In this demo, I am showcasing:
  - How users can **add** or **delete** a tag.
  - How to **save** a bookmark to an existing folder.
  - How to **move** a bookmark from one folder to another.
  - How to **save text as a bookmark**.
  - How to **update a bookmark's title**.



https://github.com/user-attachments/assets/6924961a-ba28-483d-88cd-69539e3eefb4
