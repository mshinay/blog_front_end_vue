export interface User {
  id: number
  username: string
  email?: string
  avatarUrl?: string
  password?: string
  role?: number
  jwtToken?: string
}
