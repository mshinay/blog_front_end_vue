<template>
  <section class="page-shell page-shell--wide person-page">
    <LoadingState v-if="isProfileLoading" />
    <p v-else-if="profileError" class="error-text">{{ profileError }}</p>
    <section v-else class="surface-stack">
      <section class="hero-surface person-hero">
        <div class="person-hero__intro">
          <p class="page-eyebrow">Author Space</p>
          <div class="person-hero__heading">
            <h1>{{ displayName }}</h1>
            <p>
              A quieter place to manage your public profile, review what you have published, and
              keep your discussions close at hand.
            </p>
          </div>

          <div v-if="profile" class="person-hero__identity">
            <img
              class="person-hero__avatar"
              :src="profile.avatarUrl || '/vite.svg'"
              alt="Current user avatar"
            />
            <div class="person-hero__copy">
              <p class="person-hero__username">@{{ profile.username }}</p>
              <p class="person-hero__bio">{{ profile.bio || 'Shape this space with a short bio and a recognizable profile.' }}</p>
            </div>
          </div>
        </div>

        <div class="panel-grid person-hero__stats">
          <article class="stats-tile">
            <span class="person-hero__stat-label">Current focus</span>
            <strong>{{ activeTabLabel }}</strong>
            <p>{{ activeTabDescription }}</p>
          </article>
          <article class="stats-tile">
            <span class="person-hero__stat-label">Profile status</span>
            <strong>{{ profile?.bio ? 'Profile in shape' : 'Needs a short bio' }}</strong>
            <p>
              {{ profile?.bio ? 'Your public presence already carries your voice across the app.' : 'A short bio helps your comments and posts feel authored.' }}
            </p>
          </article>
        </div>
      </section>

      <section class="panel-card person-shell">
        <nav class="person-tabs" aria-label="Personal center sections">
          <button
            v-for="tab in tabs"
            :key="tab"
            type="button"
            class="tab-btn person-tabs__button"
            :class="{ active: activeTab === tab }"
            @click="switchTab(tab)"
          >
            <span class="person-tabs__label">{{ tabLabelMap[tab] }}</span>
            <small class="person-tabs__hint">{{ tabHintMap[tab] }}</small>
          </button>
        </nav>

        <section class="person-shell__panel">
          <AccountSettingsPanel
            v-if="activeTab === 'account'"
            :profile="profile"
            @updated="updateProfile"
          />
          <MyArticlesPanel v-else-if="activeTab === 'articles'" />
          <MyCommentsPanel v-else />
        </section>
      </section>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { getPublicUser } from '@/api/modules/user'
import LoadingState from '@/components/common/LoadingState.vue'
import AccountSettingsPanel from '@/components/person/AccountSettingsPanel.vue'
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
const tabHintMap: Record<PersonTab, string> = {
  account: 'Profile, avatar, and bio',
  articles: 'Published writing and actions',
  comments: 'Discussion history and edits',
}
const tabDescriptionMap: Record<PersonTab, string> = {
  account: 'Refresh your public author profile and keep your presentation current.',
  articles: 'Review published work, revisit summaries, and manage article actions.',
  comments: 'Track your reading conversations, edits, and reply history in one place.',
}

const activeTab = ref<PersonTab>('account')
const profile = ref<UserProfile | null>(null)
const isProfileLoading = ref(false)
const profileError = ref('')

const displayName = computed(() => {
  return profile.value?.nickname || profile.value?.username || authStore.currentUser?.nickname || 'Personal Center'
})

const activeTabLabel = computed(() => tabLabelMap[activeTab.value])
const activeTabDescription = computed(() => tabDescriptionMap[activeTab.value])

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

function updateProfile(nextProfile: UserProfile): void {
  profile.value = nextProfile
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
  gap: var(--space-24);
}

.person-hero {
  display: grid;
  gap: var(--space-24);
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  align-items: start;
}

.person-hero__intro,
.person-hero__heading,
.person-hero__identity {
  display: grid;
  gap: var(--space-12);
}

.person-hero__heading p {
  max-width: 42rem;
  font-size: var(--text-body-lg);
  color: var(--color-muted);
}

.person-hero__identity {
  grid-template-columns: auto 1fr;
  align-items: center;
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-divider);
}

.person-hero__avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
}

.person-hero__copy {
  display: grid;
  gap: var(--space-8);
}

.person-hero__username {
  color: var(--color-text-soft);
  font-weight: 700;
}

.person-hero__bio {
  color: var(--color-muted);
}

.person-hero__stats {
  grid-template-columns: 1fr;
}

.person-hero__stat-label {
  color: var(--color-text-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.person-shell {
  display: grid;
  gap: var(--space-24);
}

.person-tabs {
  display: grid;
  gap: var(--space-12);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.person-tabs__button {
  min-height: 0;
  padding: var(--space-16);
  border-radius: var(--radius-lg);
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 92%, white);
  color: var(--color-text);
  box-shadow: inset 0 -1px 0 rgba(31, 42, 51, 0.03);
  display: grid;
  justify-items: start;
  gap: var(--space-6);
  text-align: left;
}

.person-tabs__button:hover {
  background: var(--color-surface-soft);
}

.person-tabs__button.active {
  border-color: var(--color-accent-soft);
  background: linear-gradient(180deg, rgba(234, 216, 203, 0.62) 0%, rgba(251, 248, 242, 0.96) 100%);
  color: var(--color-text);
}

.person-tabs__label {
  font-size: var(--text-body);
  font-weight: 700;
}

.person-tabs__hint {
  color: var(--color-muted);
  line-height: var(--line-meta);
}

.person-shell__panel {
  display: grid;
}

@media (max-width: 1024px) {
  .person-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .person-tabs {
    grid-template-columns: 1fr;
  }

  .person-tabs__button {
    padding: var(--space-12);
  }

  .person-hero__identity {
    grid-template-columns: 1fr;
  }
}
</style>
