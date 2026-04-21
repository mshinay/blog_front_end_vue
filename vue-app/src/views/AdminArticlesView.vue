<template>
  <section class="admin-page">
    <header>
      <h1>{{ t('adminArticles.title') }}</h1>
      <p>{{ t('adminArticles.description') }}</p>
      <form class="search-form" @submit.prevent="submitSearch">
        <input
          v-model.trim="keywordInput"
          type="text"
          :placeholder="t('adminArticles.searchPlaceholder')"
        />
        <button type="submit">{{ t('adminArticles.actions.search') }}</button>
      </form>
    </header>

    <ul v-if="articles.length > 0" class="list">
      <li v-for="article in articles" :key="article.id" class="item">
        <RouterLink class="title" :to="`/article/${article.id}`">{{ article.title }}</RouterLink>
        <div class="meta-grid">
          <span class="meta"><strong>{{ t('adminArticles.labels.author') }}:</strong> {{ article.authorName }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.category') }}:</strong> {{ article.categoryName }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.status') }}:</strong> {{ formatStatus(article.status) }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.top') }}:</strong> {{ formatBoolean(article.isTop) }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.comments') }}:</strong> {{ formatBoolean(article.allowComment) }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.published') }}:</strong> {{ article.publishTime }}</span>
          <span class="meta"><strong>{{ t('adminArticles.labels.updated') }}:</strong> {{ article.updatedTime }}</span>
        </div>
        <button
          type="button"
          class="danger"
          :disabled="deletingId === article.id"
          @click="deleteFromAdmin(article.id)"
        >
          {{
            deletingId === article.id ? t('adminArticles.actions.deleting') : t('adminArticles.actions.delete')
          }}
        </button>
      </li>
    </ul>

    <EmptyState v-else-if="!isLoading && !errorMessage" :message="t('adminArticles.empty')" />
    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button v-if="hasLoadError" type="button" class="retry-btn" @click="retryLoadMore">
        {{ t('adminArticles.actions.retry') }}
      </button>
    </p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && articles.length > 0" class="end-text">{{ t('adminArticles.end') }}</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { deleteArticle, getAdminArticleList } from '@/api/modules/article'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { AdminArticleItem } from '@/types/article'

const route = useRoute()
const router = useRouter()
const pageSize = 10
const { t } = useI18n()

const keywordInput = ref('')
const activeKeyword = ref('')
const articles = ref<AdminArticleItem[]>([])
const page = ref(1)
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const deletingId = ref<number | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value && !hasLoadError.value)

function formatStatus(status: AdminArticleItem['status']): string {
  if (status === 0) {
    return t('adminArticles.statuses.draft')
  }

  if (status === 1) {
    return t('adminArticles.statuses.published')
  }

  return t('adminArticles.statuses.deleted')
}

function formatBoolean(value: number): string {
  return value === 1 ? t('adminArticles.values.yes') : t('adminArticles.values.no')
}

function resetState(): void {
  articles.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
  hasLoadError.value = false
}

function clearLoadError(): void {
  errorMessage.value = ''
  hasLoadError.value = false
}

function retryLoadMore(): void {
  clearLoadError()
  void loadMore()
}

function buildAdminArticleQuery(currentPage: number) {
  return {
    page: currentPage,
    pageSize,
    ...(activeKeyword.value ? { keyword: activeKeyword.value } : {}),
  }
}

async function loadMore(): Promise<void> {
  if (isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()

  try {
    const result = await getAdminArticleList(buildAdminArticleQuery(page.value))

    const records = result.records ?? []
    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    articles.value.push(...records)
    page.value += 1
  } catch (error) {
    hasLoadError.value = true
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('adminArticles.errors.loadFailed')
    }
  } finally {
    isLoading.value = false
  }
}

async function refreshList(): Promise<void> {
  const pagesToReload = Math.max(page.value - 1, 1)
  resetState()

  for (let currentPage = 1; currentPage <= pagesToReload; currentPage += 1) {
    await loadMore()

    if (allLoaded.value) {
      break
    }
  }
}

async function submitSearch(): Promise<void> {
  await router.push({
    name: 'admin-articles',
    query: keywordInput.value ? { q: keywordInput.value } : {},
  })
}

async function syncKeyword(): Promise<void> {
  const routeKeyword = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  keywordInput.value = routeKeyword
  activeKeyword.value = routeKeyword
  resetState()
  await loadMore()
}

async function deleteFromAdmin(articleId: number): Promise<void> {
  if (!confirm(t('adminArticles.confirmDelete'))) {
    return
  }

  deletingId.value = articleId
  errorMessage.value = ''
  try {
    await deleteArticle(articleId)
    await refreshList()
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('adminArticles.errors.deleteFailed')
    }
  } finally {
    deletingId.value = null
  }
}

watch(
  () => route.query.q,
  () => {
    void syncKeyword()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMore, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.45rem 0 0;
  color: var(--color-muted);
}

.search-form {
  margin-top: 0.75rem;
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
  padding: 0.55rem 1rem;
  cursor: pointer;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.65rem;
}

.item {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  padding: 0.8rem;
  display: grid;
  gap: 0.4rem;
}

.meta-grid {
  display: grid;
  gap: 0.25rem;
}

.title {
  text-decoration: none;
  font-weight: 700;
}

.meta {
  font-size: 0.9rem;
  color: var(--color-muted);
}

.danger {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  background: #ffebe9;
  color: #9a2518;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
}

.danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 12px;
  background: #fff2f2;
  padding: 0.75rem;
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
</style>
