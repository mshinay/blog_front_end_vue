<template>
  <section class="panel">
    <header>
      <h2>Account Settings</h2>
      <p>Keep your profile details current.</p>
    </header>

    <section v-if="profile" class="profile-summary">
      <img class="summary-avatar" :src="profile.avatarUrl || '/vite.svg'" alt="Profile avatar" />
      <div>
        <p class="summary-name">{{ profile.nickname || profile.username }}</p>
        <p class="summary-username">@{{ profile.username }}</p>
        <p class="summary-bio">{{ profile.bio || 'No bio yet.' }}</p>
      </div>
    </section>

    <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <div class="avatar-section">
      <img class="avatar" :src="avatarPreview" alt="User avatar" />
      <label class="avatar-btn" :class="{ disabled: isUploadingAvatar }">
        {{ isUploadingAvatar ? 'Uploading...' : 'Upload Avatar' }}
        <input
          type="file"
          accept="image/*"
          :disabled="isUploadingAvatar"
          @change="handleAvatarChange"
        />
      </label>
    </div>

    <form class="field-row" @submit.prevent="submitField('username')">
      <label for="setting-username">Username</label>
      <div class="input-wrap">
        <input id="setting-username" v-model.trim="usernameInput" type="text" maxlength="32" />
        <button type="submit" :disabled="isSubmittingField === 'username'">
          {{ isSubmittingField === 'username' ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>

    <form class="field-row" @submit.prevent="submitField('email')">
      <label for="setting-email">Email</label>
      <div class="input-wrap">
        <input id="setting-email" v-model.trim="emailInput" type="email" />
        <button type="submit" :disabled="isSubmittingField === 'email'">
          {{ isSubmittingField === 'email' ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>

    <form class="field-row" @submit.prevent="submitField('password')">
      <label for="setting-password">Password</label>
      <div class="input-wrap">
        <input
          id="setting-password"
          v-model="passwordInput"
          type="password"
          minlength="6"
          placeholder="At least 6 characters"
        />
        <button type="submit" :disabled="isSubmittingField === 'password'">
          {{ isSubmittingField === 'password' ? 'Saving...' : 'Save' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppError } from '@/api/client'
import { updateUserProfile, uploadAvatar } from '@/api/modules/user'
import { useAuthStore } from '@/stores/auth'
import type { UserProfile } from '@/types/user'

type ProfileField = 'username' | 'email' | 'password'

defineProps<{
  profile?: UserProfile | null
}>()

const authStore = useAuthStore()

const usernameInput = ref('')
const emailInput = ref('')
const passwordInput = ref('')

const isSubmittingField = ref<ProfileField | null>(null)
const isUploadingAvatar = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const avatarPreview = computed(() => authStore.currentUser?.avatarUrl || '/vite.svg')

function resetMessages(): void {
  errorMessage.value = ''
  successMessage.value = ''
}

function validateEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value)
}

function validateField(field: ProfileField, value: string): string {
  if (!value) {
    return 'Input cannot be empty.'
  }

  if (field === 'email' && !validateEmail(value)) {
    return 'Please enter a valid email address.'
  }

  if (field === 'password' && value.length < 6) {
    return 'Password must be at least 6 characters.'
  }

  return ''
}

async function updateField(payload: { username?: string; email?: string; password?: string; avatarUrl?: string }): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = 'Unable to identify current user.'
    return
  }

  const updatedUser = await updateUserProfile({
    id: userId,
    ...payload,
  })
  authStore.updateCurrentUser(updatedUser)
}

async function submitField(field: ProfileField): Promise<void> {
  const rawValue =
    field === 'username' ? usernameInput.value : field === 'email' ? emailInput.value : passwordInput.value

  resetMessages()
  const validationError = validateField(field, rawValue.trim())
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isSubmittingField.value = field
  try {
    if (field === 'username') {
      await updateField({ username: usernameInput.value.trim() })
    }

    if (field === 'email') {
      await updateField({ email: emailInput.value.trim() })
    }

    if (field === 'password') {
      await updateField({ password: passwordInput.value })
      passwordInput.value = ''
    }

    successMessage.value = `${field} updated successfully.`
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to update profile.'
    }
  } finally {
    isSubmittingField.value = null
  }
}

async function handleAvatarChange(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) {
    return
  }

  resetMessages()
  isUploadingAvatar.value = true
  try {
    const avatarUrl = await uploadAvatar(file)
    await updateField({ avatarUrl })
    successMessage.value = 'avatar updated successfully.'
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to upload avatar.'
    }
  } finally {
    isUploadingAvatar.value = false
    if (target) {
      target.value = ''
    }
  }
}

watch(
  () => authStore.currentUser,
  (currentUser) => {
    usernameInput.value = currentUser?.username ?? ''
    emailInput.value = currentUser?.email ?? ''
  },
  { immediate: true },
)
</script>

<style scoped>
.panel {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
  display: grid;
  gap: 1rem;
}

h2 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.profile-summary {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fcfdff;
  padding: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.summary-avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.summary-name,
.summary-username,
.summary-bio {
  margin: 0;
}

.summary-name {
  font-weight: 700;
}

.summary-username,
.summary-bio {
  color: var(--color-muted);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.avatar-btn {
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
}

.avatar-btn input {
  display: none;
}

.avatar-btn.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.field-row {
  display: grid;
  gap: 0.4rem;
}

.field-row label {
  font-weight: 600;
}

.input-wrap {
  display: flex;
  gap: 0.6rem;
}

.input-wrap input {
  flex: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.input-wrap button {
  border: 0;
  border-radius: 10px;
  background: var(--color-text);
  color: var(--color-surface);
  min-width: 88px;
  cursor: pointer;
}

.input-wrap button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-text {
  margin: 0;
  color: #067647;
  background: #ecfdf3;
  border: 1px solid #abefc6;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.error-text {
  margin: 0;
  color: #b42318;
  background: #fff2f2;
  border: 1px solid #f6d0ce;
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

@media (max-width: 768px) {
  .input-wrap {
    flex-direction: column;
  }
}
</style>
