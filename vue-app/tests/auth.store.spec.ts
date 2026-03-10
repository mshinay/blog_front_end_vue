import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { loginMock, registerMock } = vi.hoisted(() => {
  return {
    loginMock: vi.fn(),
    registerMock: vi.fn(),
  }
})

vi.mock('@/api/modules/user', () => {
  return {
    login: loginMock,
    register: registerMock,
  }
})

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    loginMock.mockReset()
    registerMock.mockReset()
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

  it('hydrates from localStorage with admin role', () => {
    localStorage.setItem('jwt', 'stored-token')
    localStorage.setItem('user', JSON.stringify({ id: 3, username: 'admin', role: 0 }))

    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
    expect(store.isAdmin).toBe(true)
    expect(store.currentUser?.username).toBe('admin')
  })

  it('loginWithPassword stores jwtToken from api', async () => {
    loginMock.mockResolvedValueOnce({
      id: 10,
      username: 'demo-login',
      role: 1,
      jwtToken: 'jwt-login',
    })
    const store = useAuthStore()

    await store.loginWithPassword({ username: 'demo', password: '123456' })

    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('jwt')).toBe('jwt-login')
    expect(loginMock).toHaveBeenCalledOnce()
  })

  it('registerAndLogin stores jwtToken from api', async () => {
    registerMock.mockResolvedValueOnce({
      id: 11,
      username: 'demo-register',
      role: 0,
      jwtToken: 'jwt-register',
    })
    const store = useAuthStore()

    await store.registerAndLogin({
      username: 'demo-register',
      email: 'demo@example.com',
      password: '123456',
    })

    expect(store.isAuthenticated).toBe(true)
    expect(store.isAdmin).toBe(true)
    expect(localStorage.getItem('jwt')).toBe('jwt-register')
    expect(registerMock).toHaveBeenCalledOnce()
  })

  it('updateCurrentUser keeps existing token when jwtToken absent', () => {
    const store = useAuthStore()

    store.setAuth('token-3', {
      id: 12,
      username: 'before',
    })

    store.updateCurrentUser({
      id: 12,
      username: 'after',
      email: 'after@example.com',
    })

    expect(store.currentUser?.username).toBe('after')
    expect(localStorage.getItem('jwt')).toBe('token-3')
  })

  it('updateCurrentUser replaces token when jwtToken provided', () => {
    const store = useAuthStore()

    store.setAuth('token-old', {
      id: 13,
      username: 'user13',
    })

    store.updateCurrentUser({
      id: 13,
      username: 'user13',
      jwtToken: 'token-new',
    })

    expect(localStorage.getItem('jwt')).toBe('token-new')
    expect(store.token).toBe('token-new')
  })
})
