import { LoginData, RegisterData, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function apiRequest<T>(url: string, options: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Ошибка запроса: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as unknown as T;
}

export async function apiPost<T>(url: string, body: object): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const authService = {
  login: (data: LoginData) => 
    apiPost<string>(`${API_BASE_URL}/auth/signin`, data),
    
  register: (data: RegisterData) => 
    apiPost<User>(`${API_BASE_URL}/auth/signup`, data),
};