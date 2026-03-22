<template>
  <section class="auth-page">
    <form class="auth-card" @submit.prevent="handleSubmit">
      <p class="eyebrow">Get Started</p>
      <h1>Create your account</h1>

      <label>
        Username
        <input v-model.trim="form.username" type="text" autocomplete="username" required />
      </label>

      <label>
        Email
        <input v-model.trim="form.email" type="email" autocomplete="email" required />
      </label>

      <label>
        Nickname
        <input v-model.trim="form.nickname" type="text" autocomplete="nickname" />
      </label>

      <label>
        Avatar URL
        <input v-model.trim="form.avatarUrl" type="url" autocomplete="url" />
      </label>

      <label>
        Bio
        <textarea v-model.trim="form.bio" rows="4" />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" autocomplete="new-password" required />
      </label>

      <label>
        Confirm Password
        <input v-model="form.confirmPassword" type="password" autocomplete="new-password" required />
      </label>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button :disabled="authStore.isLoading" type="submit" class="submit-btn">
        {{ authStore.isLoading ? 'Creating account...' : 'Create account' }}
      </button>

      <p class="hint">
        Already have an account?
        <RouterLink to="/login">Log in</RouterLink>
      </p>
    </form>
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
  min-height: calc(100vh - 150px);
  display: grid;
  place-items: center;
}

.auth-card {
  width: min(460px, 100%);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.eyebrow {
  margin: 0;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

h1 {
  margin: 0 0 0.4rem;
  font-family: var(--font-display);
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-weight: 600;
}

input {
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-border-strong);
}

textarea {
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-border-strong);
  font: inherit;
  resize: vertical;
}

.submit-btn {
  border: 0;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  background: var(--color-text);
  color: var(--color-surface);
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.4rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
  font-size: 0.9rem;
}

.hint {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}
</style>
