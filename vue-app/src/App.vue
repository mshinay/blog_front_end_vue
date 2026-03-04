<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: radial-gradient(circle at top, var(--color-surface-strong) 0%, var(--color-surface) 40%, var(--color-bg) 100%);
}

.app-main {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
}

@media (max-width: 768px) {
  .app-main {
    padding: 1rem 0.75rem 2rem;
  }
}
</style>
