export interface UserSummary {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  role: number
  status: number
  jwtToken: string
}

export interface UserProfile {
  id: number
  username: string
  nickname: string
  avatarUrl: string
  bio: string
}

export interface User extends Partial<UserSummary>, Partial<UserProfile> {
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
