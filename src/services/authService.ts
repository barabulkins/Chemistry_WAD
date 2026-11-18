import axios from 'axios';
import type { AuthUser } from '../types/sample';

// Настройка axios для передачи сессионных куки connect.sid
axios.defaults.withCredentials = true;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
}

/**
 * Сервис аутентификации:
 * Согласно требованиям лабораторной работы №6:
 * Использует ТОЛЬКО axios НАПРЯМУЮ, без кодогенерации и без redux-thunk.
 * Состояние передается в Redux вручную через dispatch в компонентах.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>('/api/users/login', payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function logoutUser(): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>('/api/users/logout', {}, {
    withCredentials: true,
  });
  return response.data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const response = await axios.post<AuthUser>('/api/users/register', payload, {
    withCredentials: true,
  });
  return response.data;
}

export async function getProfile(): Promise<AuthUser> {
  const response = await axios.get<AuthUser>('/api/users/me', {
    withCredentials: true,
  });
  return response.data;
}
