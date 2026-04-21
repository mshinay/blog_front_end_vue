<template>
  <section class="loading-state panel-card" :class="{ 'loading-state--compact': compact }">
    <span v-if="eyebrow" class="page-eyebrow">{{ eyebrow }}</span>
    <div class="loading-state__mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <h2>{{ resolvedTitle }}</h2>
    <p>{{ resolvedMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

const { t } = useI18n()

const resolvedTitle = computed(() => props.title || t('states.loadingTitle'))
const resolvedMessage = computed(() => props.message || t('states.loadingMessage'))
</script>

<style scoped>
.loading-state {
  justify-items: center;
  text-align: center;
  gap: var(--space-10);
  padding-block: clamp(var(--space-24), 4vw, var(--space-32));
}

.loading-state h2 {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
}

.loading-state p {
  max-width: 28rem;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.loading-state__mark {
  display: inline-flex;
  align-items: center;
  gap: var(--space-6);
}

.loading-state__mark span {
  width: 0.65rem;
  height: 0.65rem;
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  animation: loading-bob 900ms var(--ease-standard) infinite;
}

.loading-state__mark span:nth-child(2) {
  animation-delay: 120ms;
}

.loading-state__mark span:nth-child(3) {
  animation-delay: 240ms;
}

.loading-state--compact {
  padding-block: var(--space-20);
}

@keyframes loading-bob {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  50% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-state__mark span {
    animation: none;
    opacity: 0.85;
  }
}
</style>
