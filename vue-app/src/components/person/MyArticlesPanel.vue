<template>
  <section class="panel">
    <header>
      <h2>My Articles</h2>
      <p>Manage the articles you have published.</p>
      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model.trim="keywordInput" type="text" placeholder="Search your articles" />
        <button type="submit">Search</button>
        <button type="button" class="ghost" @click="resetSearch">Reset</button>
      </form>
    </header>

    <ul v-if="articles.length > 0" class="list">
      <li v-for="article in articles" :key="article.id" class="item">
        <RouterLink class="title" :to="`/article/${article.id}`">{{ article.title }}</RouterLink>
        <p class="summary">{{ resolveSummary(article.summary, article.content) }}</p>
        <p class="meta">{{ article.createTime ?? '' }}</p>
        <div class="actions">
          <RouterLink
            v-if="canEditArticle(authStore.currentUser, article)"
            class="edit-link"
            :to="`/edit-article/${article.id}`"
          >
            Edit
          </RouterLink>
          <button
            v-if="canDeleteArticle(authStore.currentUser, article)"
            type="button"
            class="danger"
            :disabled="deletingId === article.id"
            @click="deleteOwnedArticle(article.id)"
          >
            {{ deletingId === article.id ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </li>
    </ul>

    <EmptyState v-else-if="!isLoading && !errorMessage" message="You have not published any articles yet." />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && articles.length > 0" class="end-text">No more articles.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppError } from '@/api/client'
import {
  deleteArticle,
  getUserArticleList,
  searchUserArticles,
} from '@/api/modules/article'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/article'
import { canDeleteArticle, canEditArticle } from '@/utils/permissions'
import { markdownToPlainText } from '@/utils/markdown'

const authStore = useAuthStore()

const keywordInput = ref('')
const activeKeyword = ref('')
const articles = ref<Article[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const deletingId = ref<number | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)

function resetState(): void {
  articles.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

function resolveSummary(summary?: string, content?: string): string {
  if (summary) {
    return summary
  }

  if (!content) {
    return 'No summary available.'
  }

  const plain = markdownToPlainText(content)
  return plain.length > 160 ? `${plain.slice(0, 160)}...` : plain
}

async function loadMore(): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = 'Please log in to view your articles.'
    allLoaded.value = true
    return
  }

  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
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
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load your articles.'
    }
  } finally {
    isLoading.value = false
  }
}

function submitSearch(): void {
  activeKeyword.value = keywordInput.value
  resetState()
  void loadMore()
}

function resetSearch(): void {
  keywordInput.value = ''
  activeKeyword.value = ''
  resetState()
  void loadMore()
}

async function deleteOwnedArticle(articleId: number): Promise<void> {
  if (!confirm('Delete this article?')) {
    return
  }

  deletingId.value = articleId
  errorMessage.value = ''
  try {
    await deleteArticle(articleId)
    articles.value = articles.value.filter((item) => item.id !== articleId)
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
  () => authStore.currentUser?.id,
  () => {
    resetState()
    void loadMore()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMore, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.panel {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
}

h2 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
}

.search-form {
  margin-top: 0.8rem;
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

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.7rem;
}

.item {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fcfdff;
  padding: 0.8rem;
  display: grid;
  gap: 0.45rem;
}

.title {
  text-decoration: none;
  font-weight: 700;
}

.summary {
  margin: 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.meta {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.86rem;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

.edit-link {
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  padding: 0.3rem 0.8rem;
}

.danger {
  border: 0;
  border-radius: 999px;
  background: #ffebe9;
  color: #9a2518;
  padding: 0.35rem 0.8rem;
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
  border-radius: 10px;
  background: #fff2f2;
  padding: 0.6rem 0.75rem;
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
}
</style>
