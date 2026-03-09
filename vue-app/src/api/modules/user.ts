import apiClient from '@/api/client'
import { unwrapData } from '@/api/client'

import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/user'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export function login(payload: LoginPayload): Promise<User> {
  return apiClient.post<ApiResponse<User>>('/user/login', payload).then(unwrapData)
}

export function register(payload: RegisterPayload): Promise<User> {
  return apiClient.post<ApiResponse<User>>('/user/register', payload).then(unwrapData)
}

export function getPublicUser(userId: string | number): Promise<User> {
  return apiClient.get<ApiResponse<User>>(`/user/public/${userId}`).then(unwrapData)
}
