import apiClient from '@/api/client'

import type { ApiResponse } from '@/types/api'
import type { User } from '@/types/user'

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload {
  username: string
  email: string
  password: string
}

export function login(payload: LoginPayload) {
  return apiClient.post<ApiResponse<User>>('/user/login', payload)
}

export function register(payload: RegisterPayload) {
  return apiClient.post<ApiResponse<User>>('/user/register', payload)
}
