import { describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'

import { resolveGuardRedirect } from '@/router/guards'

function createRoute(meta: Record<string, unknown>, name: string, fullPath = '/target') {
  return {
    meta,
    name,
    fullPath,
  } as unknown as RouteLocationNormalized
}

describe('router guards', () => {
  it('redirects unauthenticated users to login for protected routes', () => {
    const result = resolveGuardRedirect(
      createRoute({ requiresAuth: true }, 'upload', '/upload'),
      {
        isAuthenticated: false,
        isAdmin: false,
      },
    )

    expect(result).toEqual({
      name: 'login',
      query: { redirect: '/upload' },
    })
  })

  it('redirects authenticated users away from login/register', () => {
    const result = resolveGuardRedirect(createRoute({}, 'login', '/login'), {
      isAuthenticated: true,
      isAdmin: false,
    })

    expect(result).toEqual({ name: 'main' })
  })

  it('redirects non-admin users from admin routes', () => {
    const result = resolveGuardRedirect(
      createRoute({ requiresAuth: true, requiresAdmin: true }, 'admin-articles', '/admin/articles'),
      {
        isAuthenticated: true,
        isAdmin: false,
      },
    )

    expect(result).toEqual({
      name: 'main',
      query: { denied: 'admin' },
    })
  })

  it('redirects unauthenticated users to login before admin denial', () => {
    const result = resolveGuardRedirect(
      createRoute({ requiresAuth: true, requiresAdmin: true }, 'admin-comments', '/admin/comments'),
      {
        isAuthenticated: false,
        isAdmin: false,
      },
    )

    expect(result).toEqual({
      name: 'login',
      query: { redirect: '/admin/comments' },
    })
  })

  it('allows admin users on admin routes', () => {
    const result = resolveGuardRedirect(
      createRoute({ requiresAuth: true, requiresAdmin: true }, 'admin-articles', '/admin/articles'),
      {
        isAuthenticated: true,
        isAdmin: true,
      },
    )

    expect(result).toBe(true)
  })
})
