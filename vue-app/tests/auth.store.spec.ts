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
      nickname: 'Demo User',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      jwtToken: 'token-1',
    })

    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('jwt')).toBe('token-1')
    expect(localStorage.getItem('user')).toBe(
      JSON.stringify({
        id: 1,
        username: 'demo',
        nickname: 'Demo User',
        avatarUrl: '/avatar.png',
        role: 1,
        status: 1,
      }),
    )
  })

  it('clears auth state', () => {
    const store = useAuthStore()

    store.setAuth('token-2', {
      id: 2,
      username: 'demo2',
      nickname: 'Demo Two',
      avatarUrl: '/two.png',
      role: 1,
      status: 1,
      jwtToken: 'token-2',
    })

    store.clearAuth()

    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('jwt')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('hydrates from localStorage with admin role', () => {
    localStorage.setItem('jwt', 'stored-token')
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 3,
        username: 'admin',
        nickname: 'Admin',
        avatarUrl: '/admin.png',
        role: 0,
        status: 1,
      }),
    )

    const store = useAuthStore()

    expect(store.isAuthenticated).toBe(true)
    expect(store.isAdmin).toBe(true)
    expect(store.currentUser?.username).toBe('admin')
    expect(store.currentUser?.nickname).toBe('Admin')
  })

  it('loginWithPassword stores auth fields from api response', async () => {
    loginMock.mockResolvedValueOnce({
      id: 10,
      username: 'demo-login',
      nickname: 'Login User',
      avatarUrl: '/login.png',
      role: 1,
      status: 1,
      jwtToken: 'jwt-login',
    })
    const store = useAuthStore()

    await store.loginWithPassword({ username: 'demo', password: '123456' })

    expect(store.isAuthenticated).toBe(true)
    expect(localStorage.getItem('jwt')).toBe('jwt-login')
    expect(store.currentUser?.nickname).toBe('Login User')
    expect(store.currentUser?.avatarUrl).toBe('/login.png')
    expect(store.currentUser?.status).toBe(1)
    expect(loginMock).toHaveBeenCalledWith({ username: 'demo', password: '123456' })
    expect(store.isLoading).toBe(false)
  })

  it('registerAndLogin stores auth fields from api response', async () => {
    registerMock.mockResolvedValueOnce({
      id: 11,
      username: 'demo-register',
      nickname: 'Register User',
      avatarUrl: '/register.png',
      role: 0,
      status: 1,
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
    expect(store.currentUser?.nickname).toBe('Register User')
    expect(store.currentUser?.avatarUrl).toBe('/register.png')
    expect(store.currentUser?.status).toBe(1)
    expect(registerMock).toHaveBeenCalledWith({
      username: 'demo-register',
      email: 'demo@example.com',
      password: '123456',
    })
    expect(store.isLoading).toBe(false)
  })

  it('resets loading state when loginWithPassword fails', async () => {
    loginMock.mockRejectedValueOnce(new Error('network'))
    const store = useAuthStore()

    await expect(store.loginWithPassword({ username: 'demo', password: '123456' })).rejects.toThrow(
      'network',
    )

    expect(store.isLoading).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('updateCurrentUser keeps existing token and stored auth fields when jwtToken absent', () => {
    const store = useAuthStore()

    store.setAuth('token-3', {
      id: 12,
      username: 'before',
      nickname: 'Before Name',
      avatarUrl: '/before.png',
      role: 1,
      status: 1,
      jwtToken: 'token-3',
    })

    store.updateCurrentUser({
      id: 12,
      username: 'after',
    })

    expect(store.currentUser?.username).toBe('after')
    expect(store.currentUser?.nickname).toBe('Before Name')
    expect(store.currentUser?.avatarUrl).toBe('/before.png')
    expect(store.currentUser?.status).toBe(1)
    expect(localStorage.getItem('jwt')).toBe('token-3')
  })

  it('updateCurrentUser replaces token when jwtToken provided', () => {
    const store = useAuthStore()

    store.setAuth('token-old', {
      id: 13,
      username: 'user13',
      nickname: 'User 13',
      avatarUrl: '/13.png',
      role: 1,
      status: 1,
      jwtToken: 'token-old',
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
