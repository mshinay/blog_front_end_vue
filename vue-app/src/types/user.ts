export interface User {
  id: number
  username: string
  email?: string
  avatarUrl?: string
  role?: number
  jwtToken?: string
}
