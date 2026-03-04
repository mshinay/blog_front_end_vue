import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('sets auth and persists to localStorage', () => {
    const store = useAuthStore()

    store.setAuth('token-1', {
      id: 1,
      username: 'demo',
      email: 'demo@example.com',
    })

    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('jwt')).toBe('token-1')
  })

  it('clears auth state', () => {
    const store = useAuthStore()

    store.setAuth('token-2', {
      id: 2,
      username: 'demo2',
    })

    store.clearAuth()

    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('jwt')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })
})
