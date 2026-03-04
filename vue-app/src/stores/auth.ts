import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

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
  const token = ref<string | null>(localStorage.getItem(JWT_KEY))
  const user = ref<User | null>(readStoredUser())

  const isAuthenticated = computed(() => Boolean(token.value))

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

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth,
  }
})
