<template>
  <section class="empty-state panel-card" :class="{ 'empty-state--compact': compact }">
    <span v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</span>
    <h2 v-if="resolvedTitle">{{ resolvedTitle }}</h2>
    <p>{{ message }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    message?: string
    compact?: boolean
  }>(),
  {
    eyebrow: '',
    title: '',
    message: 'No data yet.',
    compact: false,
  },
)

useSlots()

const resolvedTitle = computed(() => props.title || (!props.eyebrow ? 'Nothing here yet.' : ''))
</script>

<style scoped>
.empty-state {
  justify-items: center;
  text-align: center;
  gap: var(--space-10);
  padding-block: clamp(var(--space-24), 5vw, var(--space-40));
  background:
    linear-gradient(180deg, rgba(251, 248, 242, 0.92) 0%, rgba(246, 241, 232, 0.96) 100%),
    var(--color-surface);
}

.empty-state h2 {
  max-width: 30rem;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
}

.empty-state p {
  max-width: 34rem;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.empty-state__action {
  margin-top: var(--space-8);
}

.empty-state--compact {
  padding-block: var(--space-24);
}
</style>
