<template>
  <section class="page-shell page-shell--wide auth-page">
    <div class="auth-stage">
      <aside class="hero-surface auth-story">
        <p class="page-eyebrow">{{ t('loginView.story.eyebrow') }}</p>
        <div class="auth-story__header">
          <h1>{{ t('loginView.story.title') }}</h1>
          <p>{{ t('loginView.story.description') }}</p>
        </div>

        <div class="auth-story__stats">
          <article class="stats-tile">
            <span class="auth-story__label">{{ t('loginView.story.stats.madeForLabel') }}</span>
            <strong>{{ t('loginView.story.stats.madeForTitle') }}</strong>
            <p>{{ t('loginView.story.stats.madeForDescription') }}</p>
          </article>
          <article class="stats-tile">
            <span class="auth-story__label">{{ t('loginView.story.stats.keepsLabel') }}</span>
            <strong>{{ t('loginView.story.stats.keepsTitle') }}</strong>
            <p>{{ t('loginView.story.stats.keepsDescription') }}</p>
          </article>
        </div>

        <div class="panel-card auth-story__note">
          <p class="page-eyebrow">{{ t('loginView.story.note.eyebrow') }}</p>
          <ul class="auth-story__list">
            <li>{{ t('loginView.story.note.item1') }}</li>
            <li>{{ t('loginView.story.note.item2') }}</li>
            <li>{{ t('loginView.story.note.item3') }}</li>
          </ul>
        </div>
      </aside>

      <form class="panel-card auth-panel" @submit.prevent="handleSubmit">
        <div class="page-header auth-panel__header">
          <p class="page-eyebrow">{{ t('loginView.panel.eyebrow') }}</p>
          <h2>{{ t('loginView.panel.title') }}</h2>
          <p>{{ t('loginView.panel.description') }}</p>
        </div>

        <div class="auth-panel__fields">
          <label class="auth-field" for="login-username">
            <span>{{ t('fields.username') }}</span>
            <input
              id="login-username"
              v-model.trim="form.username"
              class="ui-input"
              type="text"
              autocomplete="username"
              :placeholder="t('loginView.panel.usernamePlaceholder')"
              required
            />
          </label>

          <label class="auth-field" for="login-password">
            <span>{{ t('fields.password') }}</span>
            <input
              id="login-password"
              v-model="form.password"
              class="ui-input"
              type="password"
              autocomplete="current-password"
              :placeholder="t('loginView.panel.passwordPlaceholder')"
              required
            />
          </label>
        </div>

        <p class="auth-panel__meta">{{ t('loginView.panel.meta') }}</p>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="auth-panel__actions">
          <button :disabled="authStore.isLoading" type="submit" class="btn-lg">
            {{ authStore.isLoading ? t('loginView.actions.submitting') : t('loginView.actions.submit') }}
          </button>
          <RouterLink class="btn secondary btn-lg" to="/register">
            {{ t('loginView.actions.createAccount') }}
          </RouterLink>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const form = reactive({
  username: '',
  password: '',
})
const errorMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = t('loginView.errors.missingCredentials')
    return
  }

  try {
    await authStore.loginWithPassword({
      username: form.username,
      password: form.password,
    })

    const redirectPath = typeof route.query.redirect === 'string' ? route.query.redirect : '/main'
    await router.push(redirectPath)
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
      return
    }

    errorMessage.value = t('loginView.errors.loginFailed')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 11rem);
  align-content: center;
  padding-block: clamp(var(--space-24), 5vw, var(--space-48));
}

.auth-stage {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: var(--space-24);
  align-items: stretch;
}

.auth-story,
.auth-panel {
  display: grid;
  gap: var(--space-24);
}

.auth-story__header {
  display: grid;
  gap: var(--space-12);
  max-width: 34rem;
}

.auth-story__header h1 {
  font-size: var(--text-display);
}

.auth-story__header p {
  font-size: var(--text-body-lg);
  color: var(--color-muted);
}

.auth-story__stats {
  display: grid;
  gap: var(--space-16);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.auth-story__label {
  color: var(--color-text-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.auth-story__note {
  gap: var(--space-12);
  align-content: start;
}

.auth-story__list {
  display: grid;
  gap: var(--space-10);
  padding-left: 1.2rem;
  color: var(--color-text-soft);
}

.auth-panel {
  align-content: start;
  padding: clamp(var(--space-24), 3vw, var(--space-32));
  background:
    linear-gradient(180deg, rgba(251, 248, 242, 0.97) 0%, rgba(246, 241, 232, 0.98) 100%),
    var(--color-surface);
}

.auth-panel__header {
  max-width: none;
}

.auth-panel__fields {
  display: grid;
  gap: var(--space-16);
}

.auth-field {
  display: grid;
  gap: var(--space-8);
  color: var(--color-text-soft);
  font-size: var(--text-body-sm);
  font-weight: 600;
}

.auth-panel__meta {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.auth-panel__actions {
  display: grid;
  gap: var(--space-12);
}

.auth-panel__actions > * {
  width: 100%;
}

@media (max-width: 1024px) {
  .auth-stage {
    grid-template-columns: 1fr;
  }

  .auth-story__stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .auth-page {
    min-height: auto;
    padding-block: var(--space-8) var(--space-24);
  }

  .auth-story,
  .auth-panel {
    gap: var(--space-20);
  }
}
</style>
