import apiClient from '@/api/client'
import { unwrapData } from '@/api/client'

import type { ApiResponse } from '@/types/api'
import type { AuthUser, User, UserProfile } from '@/types/user'

export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  nickname?: string
  avatarUrl?: string
  bio?: string
}

export interface UpdateUserPayload {
  id: number
  username?: string
  email?: string
  password?: string
  avatarUrl?: string
}

export function login(payload: LoginPayload): Promise<AuthUser> {
  return apiClient.post<ApiResponse<AuthUser>>('/api/users/login', payload).then(unwrapData)
}

export function register(payload: RegisterPayload): Promise<AuthUser> {
  const body: RegisterPayload = {
    username: payload.username.trim(),
    email: payload.email.trim(),
    password: payload.password,
  }

  const nickname = payload.nickname?.trim()
  const avatarUrl = payload.avatarUrl?.trim()
  const bio = payload.bio?.trim()

  if (nickname) {
    body.nickname = nickname
  }

  if (avatarUrl) {
    body.avatarUrl = avatarUrl
  }

  if (bio) {
    body.bio = bio
  }

  return apiClient
    .post<ApiResponse<AuthUser>>('/api/users/register', body)
    .then(unwrapData)
}

export function getPublicUser(userId: string | number): Promise<UserProfile> {
  return apiClient.get<ApiResponse<UserProfile>>(`/api/users/${userId}`).then(unwrapData)
}

export function updateUserProfile(payload: UpdateUserPayload): Promise<User> {
  return apiClient.post<ApiResponse<User>>('/user/update', payload).then(unwrapData)
}

export function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  return apiClient.post<ApiResponse<string>>('/common/upload', formData).then(unwrapData)
}
