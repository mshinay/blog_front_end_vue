<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink class="brand" to="/main">Blog Front End</RouterLink>

      <nav class="nav-links">
        <RouterLink to="/main">Home</RouterLink>
        <RouterLink to="/search">Search</RouterLink>
        <RouterLink to="/upload">Write</RouterLink>
        <RouterLink to="/person">Profile</RouterLink>
      </nav>

      <div class="auth-actions">
        <RouterLink v-if="!authStore.isAuthenticated" class="btn ghost" to="/login">Log in</RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" class="btn" to="/register">Sign up</RouterLink>
        <button v-else class="btn" type="button" @click="handleLogout">Log out</button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout(): void {
  authStore.clearAuth()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1rem;
}

.brand {
  font-family: var(--font-display);
  font-size: 1.1rem;
  text-decoration: none;
  color: var(--color-text);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--color-muted);
  font-weight: 600;
}

.nav-links a.router-link-active {
  color: var(--color-text);
}

.auth-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.4rem 0.8rem;
  text-decoration: none;
  cursor: pointer;
}

.btn.ghost {
  background: transparent;
  color: var(--color-text);
}

@media (max-width: 900px) {
  .header-inner {
    flex-wrap: wrap;
    min-height: auto;
    padding: 0.75rem;
  }

  .nav-links {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
