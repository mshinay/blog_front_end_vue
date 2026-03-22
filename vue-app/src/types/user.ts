export interface AuthUser {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  role: number
  status: number
  jwtToken: string
}

export type StoredUser = Omit<AuthUser, 'jwtToken'>

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  bio: string
}

export interface User extends Partial<AuthUser>, Partial<UserProfile> {
  id: number
  username: string
  nickname?: string
  avatarUrl?: string
  role?: number
  status?: number
  jwtToken?: string
  bio?: string
  email?: string
  password?: string
}
