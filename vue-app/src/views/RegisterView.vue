<template>
  <section class="page-shell page-shell--wide auth-page">
    <div class="auth-stage">
      <aside class="hero-surface auth-story">
        <p class="page-eyebrow">New Account</p>
        <div class="auth-story__header">
          <h1>Open your author corner.</h1>
          <p>
            Create a profile that feels at home inside the editorial system, then publish,
            comment, and shape your own reading identity from day one.
          </p>
        </div>

        <div class="auth-story__highlights">
          <article class="stats-tile">
            <span class="auth-story__label">Profile Tone</span>
            <strong>Human, not generic</strong>
            <p>Nickname, avatar, and short bio let your posts feel authored instead of anonymous.</p>
          </article>
          <article class="stats-tile">
            <span class="auth-story__label">Publishing Flow</span>
            <strong>Ready to write</strong>
            <p>Your account feeds directly into article publishing, reading, and discussion spaces.</p>
          </article>
        </div>

        <div class="panel-grid">
          <article class="panel-card auth-story__panel">
            <p class="page-eyebrow">Essentials</p>
            <p>Username, email, and password are required to create your account securely.</p>
          </article>
          <article class="panel-card auth-story__panel">
            <p class="page-eyebrow">Optional Details</p>
            <p>Nickname, avatar URL, and bio help your public presence feel intentional from the start.</p>
          </article>
        </div>
      </aside>

      <form class="panel-card auth-panel" @submit.prevent="handleSubmit">
        <div class="page-header auth-panel__header">
          <p class="page-eyebrow">Create Account</p>
          <h2>Join the blog</h2>
          <p>Set up your access, then continue straight into the main reading and publishing flow.</p>
        </div>

        <div class="auth-panel__grid">
          <label class="auth-field" for="register-username">
            <span>Username</span>
            <input
              id="register-username"
              v-model.trim="form.username"
              class="ui-input"
              type="text"
              autocomplete="username"
              placeholder="Choose a username"
              required
            />
          </label>

          <label class="auth-field" for="register-email">
            <span>Email</span>
            <input
              id="register-email"
              v-model.trim="form.email"
              class="ui-input"
              type="email"
              autocomplete="email"
              placeholder="name@example.com"
              required
            />
          </label>

          <label class="auth-field" for="register-nickname">
            <span>Nickname</span>
            <input
              id="register-nickname"
              v-model.trim="form.nickname"
              class="ui-input"
              type="text"
              autocomplete="nickname"
              placeholder="How readers will see you"
            />
          </label>

          <label class="auth-field" for="register-avatar">
            <span>Avatar URL</span>
            <input
              id="register-avatar"
              v-model.trim="form.avatarUrl"
              class="ui-input"
              type="url"
              autocomplete="url"
              placeholder="https://example.com/avatar.jpg"
            />
          </label>
        </div>

        <label class="auth-field" for="register-bio">
          <span>Bio</span>
          <textarea
            id="register-bio"
            v-model.trim="form.bio"
            class="ui-textarea"
            rows="4"
            placeholder="Write a short note about what you read, make, or publish."
          />
        </label>

        <div class="auth-panel__grid">
          <label class="auth-field" for="register-password">
            <span>Password</span>
            <input
              id="register-password"
              v-model="form.password"
              class="ui-input"
              type="password"
              autocomplete="new-password"
              placeholder="Create a password"
              required
            />
          </label>

          <label class="auth-field" for="register-confirm-password">
            <span>Confirm Password</span>
            <input
              id="register-confirm-password"
              v-model="form.confirmPassword"
              class="ui-input"
              type="password"
              autocomplete="new-password"
              placeholder="Repeat your password"
              required
            />
          </label>
        </div>

        <p class="auth-panel__meta">
          Required fields create the account immediately. Optional profile details can help your
          first posts and comments feel more recognizable.
        </p>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

        <div class="auth-panel__actions">
          <button :disabled="authStore.isLoading" type="submit" class="btn-lg">
            {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
          </button>
          <RouterLink class="btn secondary btn-lg" to="/login">Already have an account? Log in</RouterLink>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  email: '',
  nickname: '',
  avatarUrl: '',
  bio: '',
  password: '',
  confirmPassword: '',
})
const errorMessage = ref('')

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!form.username || !form.email || !form.password || !form.confirmPassword) {
    errorMessage.value = 'Please fill all fields.'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  try {
    await authStore.registerAndLogin({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      nickname: form.nickname.trim() || undefined,
      avatarUrl: form.avatarUrl.trim() || undefined,
      bio: form.bio.trim() || undefined,
    })

    await router.push('/main')
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
      return
    }

    errorMessage.value = 'Registration failed, please try again.'
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
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
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
  max-width: 36rem;
}

.auth-story__header h1 {
  font-size: var(--text-display);
}

.auth-story__header p {
  font-size: var(--text-body-lg);
  color: var(--color-muted);
}

.auth-story__highlights {
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

.auth-story__panel {
  gap: var(--space-10);
  align-content: start;
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

.auth-panel__grid {
  display: grid;
  gap: var(--space-16);
  grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .auth-stage,
  .auth-story__highlights,
  .auth-panel__grid {
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
