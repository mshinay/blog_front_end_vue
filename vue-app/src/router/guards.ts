import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'

interface AuthState {
  isAuthenticated: boolean
  isAdmin: boolean
}

export function resolveGuardRedirect(
  to: RouteLocationNormalized,
  auth: AuthState,
): NavigationGuardReturn {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (auth.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return { name: 'main' }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return {
      name: 'main',
      query: { denied: 'admin' },
    }
  }

  return true
}
