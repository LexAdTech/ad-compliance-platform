export interface User {
  id: number;
  username: string;
  email: string;
  role: { role: string };
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export type AuthMode = 'login' | 'register';

// types/index.ts
export interface Article {
  id: string;
  title: string;
  text: string; // Markdown содержимое
  excerpt?: string; // Краткое описание
  created_at: string;
}

export interface ArticleWithHtml extends Article {
  contentHtml?: string;
}