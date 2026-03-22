<template>
  <section class="person-page">
    <header>
      <h1>Personal Center</h1>
      <p>Manage your profile and your own content.</p>
    </header>

    <LoadingState v-if="isProfileLoading" />
    <p v-else-if="profileError" class="error-text">{{ profileError }}</p>
    <section v-else-if="profile" class="profile-card">
      <img :src="profile.avatarUrl || '/vite.svg'" alt="Current user avatar" />
      <div>
        <h2>{{ profile.nickname || profile.username }}</h2>
        <p class="username">@{{ profile.username }}</p>
        <p>{{ profile.bio || 'You have not added a bio yet.' }}</p>
      </div>
    </section>

    <nav class="tabs" aria-label="Personal center sections">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="switchTab(tab)"
      >
        {{ tabLabelMap[tab] }}
      </button>
    </nav>

    <AccountSettingsPanel v-if="activeTab === 'account'" :profile="profile" />
    <MyArticlesPanel v-else-if="activeTab === 'articles'" />
    <MyCommentsPanel v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { getPublicUser } from '@/api/modules/user'
import AccountSettingsPanel from '@/components/person/AccountSettingsPanel.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import MyArticlesPanel from '@/components/person/MyArticlesPanel.vue'
import MyCommentsPanel from '@/components/person/MyCommentsPanel.vue'
import { useAuthStore } from '@/stores/auth'
import type { UserProfile } from '@/types/user'
import { PERSON_TABS, resolvePersonTab, type PersonTab } from '@/utils/person-tabs'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tabs = PERSON_TABS
const tabLabelMap: Record<PersonTab, string> = {
  account: 'Account Settings',
  articles: 'My Blogs',
  comments: 'My Comments',
}

const activeTab = ref<PersonTab>('account')
const profile = ref<UserProfile | null>(null)
const isProfileLoading = ref(false)
const profileError = ref('')

async function loadProfile(): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    profile.value = null
    profileError.value = 'Unable to identify current user.'
    return
  }

  isProfileLoading.value = true
  profileError.value = ''
  try {
    profile.value = await getPublicUser(userId)
  } catch (error) {
    profile.value = null
    if (error instanceof AppError) {
      profileError.value = error.message
    } else {
      profileError.value = 'Failed to load profile.'
    }
  } finally {
    isProfileLoading.value = false
  }
}

async function switchTab(tab: PersonTab): Promise<void> {
  if (activeTab.value === tab) {
    return
  }

  await router.replace({
    name: 'person-center',
    query: { ...route.query, tab },
  })
}

watch(
  () => route.query.tab,
  (tabQuery) => {
    const nextTab = resolvePersonTab(tabQuery)
    activeTab.value = nextTab

    if (tabQuery !== nextTab) {
      void router.replace({
        name: 'person-center',
        query: { ...route.query, tab: nextTab },
      })
    }
  },
  { immediate: true },
)

watch(
  () => authStore.currentUser?.id,
  () => {
    void loadProfile()
  },
  { immediate: true },
)
</script>

<style scoped>
.person-page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

h2 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
}

.profile-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.profile-card img {
  width: 68px;
  height: 68px;
  border-radius: 999px;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.profile-card p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
}

.profile-card .username {
  font-weight: 600;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 10px;
  background: #fff2f2;
  padding: 0.6rem 0.75rem;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.tab-btn {
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: #fff;
  color: var(--color-text);
  padding: 0.38rem 0.85rem;
  cursor: pointer;
}

.tab-btn.active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-surface);
}
</style>
