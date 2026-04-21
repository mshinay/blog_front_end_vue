<template>
  <section class="user-page">
    <p v-if="profileError" class="error-text">{{ profileError }}</p>

    <header v-else-if="userProfile" class="profile-card">
      <img :src="userProfile.avatarUrl || '/vite.svg'" :alt="t('userPage.avatarAlt')" />
      <div>
        <h1>{{ userProfile.nickname || userProfile.username }}</h1>
        <p class="username">@{{ userProfile.username }}</p>
        <p>{{ userProfile.bio || t('userPage.bioFallback') }}</p>
      </div>
    </header>

    <LoadingState v-else-if="isProfileLoading" />

    <form class="search-form" @submit.prevent="submitSearch">
      <input v-model.trim="keywordInput" type="text" :placeholder="t('userPage.searchPlaceholder')" />
      <button type="submit">{{ t('userPage.actions.search') }}</button>
      <button type="button" class="ghost" @click="resetSearch">{{ t('userPage.actions.reset') }}</button>
    </form>

    <div v-if="articles.length > 0" class="article-list">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <EmptyState
      v-else-if="!isArticleLoading && !articleError"
      :message="t('userPage.empty')"
    />

    <p v-if="articleError" class="error-text">
      {{ articleError }}
      <button
        v-if="hasArticleLoadError"
        type="button"
        class="retry-btn"
        @click="retryLoadMoreArticles"
      >
        {{ t('common.retry') }}
      </button>
    </p>
    <LoadingState v-if="isArticleLoading" />

    <p v-if="allLoaded && articles.length > 0" class="end-text">{{ t('userPage.end') }}</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { getUserArticleList, searchUserArticles } from '@/api/modules/article'
import { getPublicUser } from '@/api/modules/user'
import ArticleCard from '@/components/article/ArticleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { Article } from '@/types/article'
import type { UserProfile } from '@/types/user'

const route = useRoute()
const { t } = useI18n()

const userProfile = ref<UserProfile | null>(null)
const isProfileLoading = ref(false)
const profileError = ref('')

const keywordInput = ref('')
const activeKeyword = ref('')
const articles = ref<Article[]>([])
const page = ref(1)
const pageSize = 10
const isArticleLoading = ref(false)
const allLoaded = ref(false)
const articleError = ref('')
const hasArticleLoadError = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(
  () => !isArticleLoading.value && !allLoaded.value && !hasArticleLoadError.value,
)
const routeUserId = computed(() => Number(route.params.userId))

function resetArticleState(): void {
  articles.value = []
  page.value = 1
  allLoaded.value = false
  articleError.value = ''
  hasArticleLoadError.value = false
}

function clearArticleLoadError(): void {
  articleError.value = ''
  hasArticleLoadError.value = false
}

function retryLoadMoreArticles(): void {
  clearArticleLoadError()
  void loadMoreArticles()
}

function ensureValidRouteUserId(): number | null {
  const currentId = routeUserId.value
  if (!Number.isInteger(currentId) || currentId <= 0) {
    profileError.value = t('userPage.errors.invalidUserId')
    allLoaded.value = true
    return null
  }

  return currentId
}

async function loadUserProfile(): Promise<void> {
  const userId = ensureValidRouteUserId()
  if (!userId) {
    return
  }

  isProfileLoading.value = true
  profileError.value = ''
  try {
    userProfile.value = await getPublicUser(userId)
  } catch (error) {
    if (error instanceof AppError) {
      profileError.value = error.message
    } else {
      profileError.value = t('userPage.errors.loadProfileFailed')
    }
  } finally {
    isProfileLoading.value = false
  }
}

async function loadMoreArticles(): Promise<void> {
  const userId = ensureValidRouteUserId()
  if (!userId || isArticleLoading.value || allLoaded.value || hasArticleLoadError.value) {
    return
  }

  isArticleLoading.value = true
  clearArticleLoadError()
  try {
    const result = activeKeyword.value
      ? await searchUserArticles(userId, activeKeyword.value, page.value, pageSize)
      : await getUserArticleList(userId, page.value, pageSize)

    const records = result.records ?? []
    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    articles.value.push(...records)
    page.value += 1
  } catch (error) {
    hasArticleLoadError.value = true
    if (error instanceof AppError) {
      articleError.value = error.message
    } else {
      articleError.value = t('userPage.errors.loadArticlesFailed')
    }
  } finally {
    isArticleLoading.value = false
  }
}

function submitSearch(): void {
  activeKeyword.value = keywordInput.value
  resetArticleState()
  void loadMoreArticles()
}

function resetSearch(): void {
  keywordInput.value = ''
  activeKeyword.value = ''
  resetArticleState()
  void loadMoreArticles()
}

watch(
  () => route.params.userId,
  () => {
    userProfile.value = null
    keywordInput.value = ''
    activeKeyword.value = ''
    resetArticleState()
    void loadUserProfile()
    void loadMoreArticles()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMoreArticles, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.user-page {
  display: grid;
  gap: 1rem;
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

h1 {
  margin: 0;
  font-family: var(--font-display);
}

.profile-card p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
}

.profile-card .username {
  font-weight: 600;
}

.search-form {
  display: flex;
  gap: 0.6rem;
}

.search-form input {
  flex: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.search-form button {
  border: 0;
  border-radius: 10px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

.search-form button.ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
}

.article-list {
  display: grid;
  gap: 0.8rem;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 10px;
  background: #fff2f2;
  padding: 0.6rem 0.75rem;
}

.retry-btn {
  margin-left: 0.75rem;
  border: 0;
  border-radius: 8px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.end-text {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .search-form {
    flex-wrap: wrap;
  }

  .profile-card {
    align-items: flex-start;
  }
}
</style>
