<template>
  <section class="auth-page">
    <form class="auth-card" @submit.prevent="handleSubmit">
      <p class="eyebrow">Welcome Back</p>
      <h1>Log in to continue</h1>

      <label>
        Username
        <input v-model.trim="form.username" type="text" autocomplete="username" required />
      </label>

      <label>
        Password
        <input v-model="form.password" type="password" autocomplete="current-password" required />
      </label>

      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

      <button :disabled="authStore.isLoading" type="submit" class="submit-btn">
        {{ authStore.isLoading ? 'Logging in...' : 'Log in' }}
      </button>

      <p class="hint">
        New here?
        <RouterLink to="/register">Create an account</RouterLink>
      </p>
    </form>
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
  min-height: calc(100vh - 150px);
  display: grid;
  place-items: center;
}

.auth-card {
  width: min(420px, 100%);
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.eyebrow {
  margin: 0;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

h1 {
  margin: 0;
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

.submit-btn {
  border: 0;
  border-radius: 12px;
  padding: 0.7rem 1rem;
  background: var(--color-text);
  color: var(--color-surface);
  font-weight: 700;
  cursor: pointer;
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
