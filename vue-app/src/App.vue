<template>
  <div class="app-shell">
    <div class="app-shell__atmosphere" aria-hidden="true" />
    <AppHeader />
    <main class="app-main">
      <div class="app-main__inner">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  background:
    radial-gradient(circle at top center, rgba(239, 231, 218, 0.94) 0%, rgba(239, 231, 218, 0) 32%),
    linear-gradient(180deg, rgba(251, 248, 242, 0.48) 0%, rgba(243, 239, 231, 0) 24%),
    var(--color-bg);
}

.app-shell__atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 10%, rgba(166, 90, 58, 0.12) 0%, rgba(166, 90, 58, 0) 26%),
    radial-gradient(circle at 86% 18%, rgba(188, 174, 155, 0.24) 0%, rgba(188, 174, 155, 0) 34%);
  opacity: 0.75;
}

.app-main {
  position: relative;
  z-index: 1;
  padding:
    clamp(var(--space-24), 4vw, var(--space-40))
    var(--layout-shell-padding)
    clamp(var(--space-40), 7vw, var(--space-64));
}

.app-main__inner {
  width: min(100%, var(--layout-page-max));
  margin: 0 auto;
}

@media (max-width: 768px) {
  .app-main {
    padding:
      var(--space-20)
      var(--layout-shell-padding-mobile)
      var(--space-40);
  }
}
</style>
