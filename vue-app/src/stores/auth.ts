import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { login, register, type LoginPayload, type RegisterPayload } from '@/api/modules/user'
import type { User } from '@/types/user'

const JWT_KEY = 'jwt'
const USER_KEY = 'user'

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch (error) {
    console.error('[auth] failed to parse stored user', error)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => Boolean(token.value))
  const currentUser = computed(() => user.value)
  const isAdmin = computed(() => user.value?.role === 0)

  function hydrate(): void {
    token.value = localStorage.getItem(JWT_KEY)
    user.value = readStoredUser()
  }

  function setAuth(nextToken: string, nextUser: User): void {
    token.value = nextToken
    user.value = nextUser
    localStorage.setItem(JWT_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    localStorage.removeItem(JWT_KEY)
    localStorage.removeItem(USER_KEY)
  }

  function resolveToken(nextUser: User): string {
    if (!nextUser.jwtToken) {
      throw new Error('Missing jwtToken in auth response')
    }

    return nextUser.jwtToken
  }

  async function loginWithPassword(payload: LoginPayload): Promise<void> {
    isLoading.value = true
    try {
      const nextUser = await login(payload)
      const nextToken = resolveToken(nextUser)
      setAuth(nextToken, nextUser)
    } finally {
      isLoading.value = false
    }
  }

  async function registerAndLogin(payload: RegisterPayload): Promise<void> {
    isLoading.value = true
    try {
      const nextUser = await register(payload)
      const nextToken = resolveToken(nextUser)
      setAuth(nextToken, nextUser)
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    clearAuth()
  }

  hydrate()

  return {
    token,
    user,
    isLoading,
    isAuthenticated,
    currentUser,
    isAdmin,
    hydrate,
    setAuth,
    clearAuth,
    loginWithPassword,
    registerAndLogin,
    logout,
  }
})
