<template>
  <section class="admin-page">
    <header>
      <h1>Admin Articles</h1>
      <p>Admin users can soft-delete articles. Editing is author-only.</p>
      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model.trim="keywordInput" type="text" placeholder="Search articles" />
        <button type="submit">Search</button>
      </form>
    </header>

    <ul v-if="articles.length > 0" class="list">
      <li v-for="article in articles" :key="article.id" class="item">
        <RouterLink class="title" :to="`/article/${article.id}`">{{ article.title }}</RouterLink>
        <div class="meta-grid">
          <span class="meta"><strong>Author:</strong> {{ article.authorName }}</span>
          <span class="meta"><strong>Category:</strong> {{ article.categoryName }}</span>
          <span class="meta"><strong>Status:</strong> {{ formatStatus(article.status) }}</span>
          <span class="meta"><strong>Top:</strong> {{ formatBoolean(article.isTop) }}</span>
          <span class="meta"><strong>Comments:</strong> {{ formatBoolean(article.allowComment) }}</span>
          <span class="meta"><strong>Published:</strong> {{ article.publishTime }}</span>
          <span class="meta"><strong>Updated:</strong> {{ article.updatedTime }}</span>
        </div>
        <button
          type="button"
          class="danger"
          :disabled="deletingId === article.id"
          @click="deleteFromAdmin(article.id)"
        >
          {{ deletingId === article.id ? 'Deleting...' : 'Delete' }}
        </button>
      </li>
    </ul>

    <EmptyState v-else-if="!isLoading && !errorMessage" message="No admin articles found." />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && articles.length > 0" class="end-text">No more articles.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { deleteArticle, getAdminArticleList } from '@/api/modules/article'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { AdminArticleItem } from '@/types/article'

const route = useRoute()
const router = useRouter()
const pageSize = 10

const keywordInput = ref('')
const activeKeyword = ref('')
const articles = ref<AdminArticleItem[]>([])
const page = ref(1)
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const deletingId = ref<number | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)

function formatStatus(status: AdminArticleItem['status']): string {
  if (status === 0) {
    return 'Draft'
  }

  if (status === 1) {
    return 'Published'
  }

  return 'Deleted'
}

function formatBoolean(value: number): string {
  return value === 1 ? 'Yes' : 'No'
}

function resetState(): void {
  articles.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

function buildAdminArticleQuery(currentPage: number) {
  return {
    page: currentPage,
    pageSize,
    ...(activeKeyword.value ? { keyword: activeKeyword.value } : {}),
  }
}

async function loadMore(): Promise<void> {
  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

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
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load admin articles.'
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
  if (!confirm('Delete this article?')) {
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
      errorMessage.value = 'Failed to delete article.'
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

.end-text {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
}

.sentinel {
  height: 1px;
}
</style>
