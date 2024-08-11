export type Bookmark = {
  id: number;
  title: string | null;
  text: string;
  screenshot: string | null;
  createdAt: Date;
  folderId: number | null;
  userId: string;
  aspectRatio: number | null;
  folder: Folder | null;
  tags: string;
};
export type Folder = {
  id: number;
  name: string;
  createdAt: Date;
  userId: string;
}

type UserRole = "ADMIN" | "USER";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  password: string | null;
}