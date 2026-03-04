<template>
  <section class="placeholder-card">
    <p class="eyebrow">Stage 1 Skeleton</p>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<style scoped>
.placeholder-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--color-muted);
}

h1 {
  margin: 0.75rem 0;
  font-family: var(--font-display);
  font-size: 1.5rem;
}

p {
  margin: 0;
  color: var(--color-muted);
}
</style>
