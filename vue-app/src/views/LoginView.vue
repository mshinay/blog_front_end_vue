<template>
  <section class="page-shell page-shell--wide auth-page">
    <div class="auth-stage">
      <aside class="hero-surface auth-story">
        <p class="page-eyebrow">Reader Access</p>
        <div class="auth-story__header">
          <h1>Return to your reading desk.</h1>
          <p>
            Pick up drafts, saved thoughts, and your latest conversations inside a calmer,
            more intentional blog workspace.
          </p>
        </div>

        <div class="auth-story__stats">
          <article class="stats-tile">
            <span class="auth-story__label">Made For</span>
            <strong>Long-form reading</strong>
            <p>Structured pages, calmer surfaces, and a sharper editorial rhythm across the app.</p>
          </article>
          <article class="stats-tile">
            <span class="auth-story__label">Keeps</span>
            <strong>Your place</strong>
            <p>Jump back into search, article detail, and your author space without losing momentum.</p>
          </article>
        </div>

        <div class="panel-card auth-story__note">
          <p class="page-eyebrow">What Awaits</p>
          <ul class="auth-story__list">
            <li>Revisit current writing threads and personal discussion history.</li>
            <li>Manage your profile, drafts, and publishing flow from one authored workspace.</li>
            <li>Stay in the same editorial system across homepage, reading pages, and search.</li>
          </ul>
        </div>
      </aside>

      <form class="panel-card auth-panel" @submit.prevent="handleSubmit">
        <div class="page-header auth-panel__header">
          <p class="page-eyebrow">Welcome Back</p>
          <h2>Log in to continue</h2>
          <p>Use your existing account to return to articles, comments, and your author tools.</p>
        </div>

        <div class="auth-panel__fields">
          <label class="auth-field" for="login-username">
            <span>Username</span>
            <input
              id="login-username"
              v-model.trim="form.username"
              class="ui-input"
              type="text"
              autocomplete="username"
              placeholder="Enter your username"
              required
            />
          </label>

          <label class="auth-field" for="login-password">
            <span>Password</span>
            <input
              id="login-password"
              v-model="form.password"
              class="ui-input"
              type="password"
              autocomplete="current-password"
              placeholder="Enter your password"
              required
            />
          </label>
        </div>

        <p class="auth-panel__meta">
          Logging in keeps your current reading path and redirects you back when a protected page
          asked for auth first.
        </p>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="auth-panel__actions">
          <button :disabled="authStore.isLoading" type="submit" class="btn-lg">
            {{ authStore.isLoading ? 'Logging in...' : 'Log in' }}
          </button>
          <RouterLink class="btn secondary btn-lg" to="/register">Create an account</RouterLink>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
})
const errorMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!form.username || !form.password) {
    errorMessage.value = 'Please enter username and password.'
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

    errorMessage.value = 'Login failed, please try again.'
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
