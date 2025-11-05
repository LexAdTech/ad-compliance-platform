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

export interface Article {
  id: number;
  title: string;
  text: string;
  excerpt?: string;
  created_at: string;
}

export interface ArticleWithHtml extends Article {
  contentHtml?: string;
}