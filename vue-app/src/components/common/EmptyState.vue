<template>
  <section class="empty-state panel-card" :class="{ 'empty-state--compact': compact }">
    <span v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</span>
    <h2 v-if="resolvedTitle">{{ resolvedTitle }}</h2>
    <p>{{ resolvedMessage }}</p>
    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'

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
    message: '',
    compact: false,
  },
)

useSlots()

const { t } = useI18n()

const resolvedTitle = computed(() => {
  if (props.title) return props.title
  return props.eyebrow ? '' : t('states.emptyTitle')
})

const resolvedMessage = computed(() => props.message || t('states.emptyMessage'))
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
