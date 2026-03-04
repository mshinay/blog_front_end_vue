<template>
  <div class="state">{{ message }}</div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: 'No data yet.',
  },
)
</script>

<style scoped>
.state {
  text-align: center;
  color: var(--color-muted);
  padding: 1rem;
  border: 1px dashed var(--color-border-strong);
  border-radius: 12px;
}
</style>
