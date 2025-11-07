
export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
}

export interface User {
  id: string;
  username: string;
  password?: string; // Should not be sent to client, but needed for creation/editing
  fullName: string;
  role: UserRole;
}

export enum PortfolioCategory {
  COMMANDER = 'ระบบแจก',
  PERSONNEL = 'โปรแกรมประยุกต์',
}

export enum PortfolioType {
  APPLICATION = 'โปรแกรมประยุกต์',
  OTHER = 'อื่นๆ',
}

export interface Rating {
  userId: string;
  score: number;
}

export interface Portfolio {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  description: string;
  category: PortfolioCategory;
  type: PortfolioType;
  coverImage: string; // base64
  albumImages: string[]; // array of base64
  views: number;
  likes: string[]; // array of user IDs
  ratings: Rating[];
  createdAt: string;
}

export type ViewMode = 'grid' | 'table';

export type PortfolioFilter = 'all' | PortfolioCategory | 'my_portfolios';