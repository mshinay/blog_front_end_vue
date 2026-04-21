<template>
  <section class="panel-card account-panel">
    <div class="page-header account-panel__header">
      <p class="page-eyebrow">{{ t('personAccount.header.eyebrow') }}</p>
      <h2>{{ t('personAccount.header.title') }}</h2>
      <p>{{ t('personAccount.header.description') }}</p>
    </div>

    <section v-if="profile" class="content-card account-summary">
      <img
        class="account-summary__avatar"
        :src="profile.avatarUrl || '/vite.svg'"
        :alt="t('personAccount.summary.avatarAlt')"
      />
      <div class="account-summary__copy">
        <p class="account-summary__name">{{ profile.nickname || profile.username }}</p>
        <p class="account-summary__username">@{{ profile.username }}</p>
        <p class="account-summary__bio">{{ profile.bio || t('personAccount.summary.noBio') }}</p>
      </div>
    </section>

    <div class="panel-grid">
      <article class="stats-tile">
        <span class="account-panel__label">{{ t('personAccount.tiles.profilePhotoLabel') }}</span>
        <strong>
          {{
            authStore.currentUser?.avatarUrl
              ? t('personAccount.tiles.profilePhotoSet')
              : t('personAccount.tiles.profilePhotoMissing')
          }}
        </strong>
        <p>{{ t('personAccount.tiles.profilePhotoMessage') }}</p>
      </article>
      <article class="stats-tile">
        <span class="account-panel__label">{{ t('personAccount.tiles.bioLengthLabel') }}</span>
        <strong>{{ bioInput.trim().length }}</strong>
        <p>{{ t('personAccount.tiles.bioLengthMessage', { max: 300 }) }}</p>
      </article>
    </div>

    <p v-if="successMessage" class="success-text">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <section class="content-card account-avatar">
      <div class="account-avatar__preview">
        <img class="account-avatar__image" :src="avatarPreview" :alt="t('personAccount.avatar.previewAlt')" />
        <div>
          <p class="account-avatar__title">{{ t('personAccount.avatar.title') }}</p>
          <p class="account-avatar__hint">{{ t('personAccount.avatar.hint') }}</p>
        </div>
      </div>

      <label class="btn secondary account-avatar__button" :class="{ 'is-disabled': isUploadingAvatar }">
        {{ isUploadingAvatar ? t('personAccount.avatar.uploading') : t('personAccount.avatar.upload') }}
        <input
          type="file"
          accept="image/*"
          :disabled="isUploadingAvatar"
          @change="handleAvatarChange"
        />
      </label>
    </section>

    <div class="surface-stack">
      <form class="content-card field-card" @submit.prevent="submitField('nickname')">
        <div class="field-card__header">
          <div>
            <p class="page-eyebrow">{{ t('personAccount.fields.displayNameEyebrow') }}</p>
            <h3>{{ t('personAccount.fields.nicknameTitle') }}</h3>
          </div>
          <button type="submit" class="secondary" :disabled="isSubmittingField === 'nickname'">
            {{ isSubmittingField === 'nickname' ? t('personAccount.actions.saving') : t('personAccount.actions.save') }}
          </button>
        </div>
        <label class="field-card__label" for="setting-nickname">
          <span>{{ t('personAccount.fields.nicknameHint') }}</span>
          <input id="setting-nickname" v-model.trim="nicknameInput" class="ui-input" type="text" maxlength="32" />
        </label>
      </form>

      <form class="content-card field-card" @submit.prevent="submitField('bio')">
        <div class="field-card__header">
          <div>
            <p class="page-eyebrow">{{ t('personAccount.fields.publicNoteEyebrow') }}</p>
            <h3>{{ t('personAccount.fields.bioTitle') }}</h3>
          </div>
          <button type="submit" class="secondary" :disabled="isSubmittingField === 'bio'">
            {{ isSubmittingField === 'bio' ? t('personAccount.actions.saving') : t('personAccount.actions.save') }}
          </button>
        </div>
        <label class="field-card__label" for="setting-bio">
          <span>{{ t('personAccount.fields.bioHint') }}</span>
          <textarea id="setting-bio" v-model.trim="bioInput" class="ui-textarea" rows="4" maxlength="300" />
        </label>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { updateUserProfile, uploadAvatar } from '@/api/modules/user'
import { useAuthStore } from '@/stores/auth'
import type { UserProfile } from '@/types/user'

type ProfileField = 'nickname' | 'bio'

const props = defineProps<{
  profile?: UserProfile | null
}>()
const emit = defineEmits<{
  updated: [profile: UserProfile]
}>()

const authStore = useAuthStore()
const { t } = useI18n()

const nicknameInput = ref('')
const bioInput = ref('')

const isSubmittingField = ref<ProfileField | null>(null)
const isUploadingAvatar = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const avatarPreview = computed(() => authStore.currentUser?.avatarUrl || '/vite.svg')

function resetMessages(): void {
  errorMessage.value = ''
  successMessage.value = ''
}

function validateField(field: ProfileField, value: string): string {
  if (!value && field !== 'bio') {
    return t('personAccount.errors.emptyInput')
  }

  if (field === 'bio' && value.length > 300) {
    return t('personAccount.errors.bioTooLong', { max: 300 })
  }

  return ''
}

function syncProfileSummary(updatedUser: UserProfile): void {
  emit('updated', updatedUser)
}

async function updateField(payload: {
  nickname?: string
  avatarUrl?: string
  bio?: string
}): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = t('personAccount.errors.missingUser')
    return
  }

  const updatedUser = await updateUserProfile({
    userId,
    ...payload,
  })
  authStore.updateCurrentUser(updatedUser)
  syncProfileSummary({
    id: updatedUser.id,
    username: updatedUser.username ?? props.profile?.username ?? authStore.currentUser?.username ?? '',
    nickname: updatedUser.nickname ?? props.profile?.nickname ?? authStore.currentUser?.nickname ?? '',
    avatarUrl: updatedUser.avatarUrl ?? props.profile?.avatarUrl ?? authStore.currentUser?.avatarUrl ?? '',
    bio: updatedUser.bio ?? props.profile?.bio ?? '',
  })
}

async function submitField(field: ProfileField): Promise<void> {
  const rawValue = field === 'nickname' ? nicknameInput.value : bioInput.value

  resetMessages()
  const validationError = validateField(field, rawValue.trim())
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  isSubmittingField.value = field
  try {
    if (field === 'nickname') {
      await updateField({ nickname: nicknameInput.value.trim() })
    }

    if (field === 'bio') {
      await updateField({ bio: bioInput.value.trim() })
    }

    successMessage.value =
      field === 'nickname'
        ? t('personAccount.success.nicknameUpdated')
        : t('personAccount.success.bioUpdated')
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('personAccount.errors.updateFailed')
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
    successMessage.value = t('personAccount.success.avatarUpdated')
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('personAccount.errors.uploadFailed')
    }
  } finally {
    isUploadingAvatar.value = false
    if (target) {
      target.value = ''
    }
  }
}

watch(
  [() => props.profile, () => authStore.currentUser],
  ([profile, currentUser]) => {
    nicknameInput.value = profile?.nickname ?? currentUser?.nickname ?? ''
    bioInput.value = profile?.bio ?? ''
  },
  { immediate: true },
)
</script>

<style scoped>
.account-panel,
.account-panel__header,
.account-summary,
.account-summary__copy,
.field-card,
.field-card__label {
  display: grid;
  gap: var(--space-16);
}

.account-summary {
  grid-template-columns: auto 1fr;
  align-items: center;
}

.account-summary__avatar,
.account-avatar__image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.account-summary__name,
.account-avatar__title {
  font-size: var(--text-body-lg);
  font-weight: 700;
  color: var(--color-text);
}

.account-summary__username,
.account-summary__bio,
.account-avatar__hint {
  color: var(--color-muted);
}

.account-panel__label {
  color: var(--color-text-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.account-avatar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-16);
}

.account-avatar__preview {
  display: flex;
  align-items: center;
  gap: var(--space-16);
}

.account-avatar__button {
  position: relative;
  overflow: hidden;
}

.account-avatar__button input {
  display: none;
}

.field-card__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-16);
}

.field-card__label > span {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

@media (max-width: 768px) {
  .account-summary,
  .account-avatar,
  .account-avatar__preview,
  .field-card__header {
    grid-template-columns: 1fr;
    display: grid;
  }

  .field-card__header {
    justify-content: start;
  }

  .field-card__header button {
    width: 100%;
  }

  .account-avatar__button {
    width: 100%;
  }
}
</style>
