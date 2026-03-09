<template>
  <section class="search-page">
    <header>
      <h1>Search Articles</h1>
      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model.trim="keywordInput" type="text" placeholder="Search by keyword" />
        <button type="submit">Search</button>
      </form>
    </header>

    <p v-if="!activeKeyword" class="hint">Enter a keyword to search.</p>

    <div v-if="results.length > 0" class="result-list">
      <ArticleCard v-for="article in results" :key="article.id" :article="article" />
    </div>

    <EmptyState
      v-else-if="activeKeyword && !isLoading && !errorMessage"
      message="No results found."
    />

    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button type="button" class="retry-btn" @click="loadMore">Retry</button>
    </p>

    <LoadingState v-if="isLoading" />
    <p v-if="allLoaded && results.length > 0" class="end-text">No more results.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { searchArticles } from '@/api/modules/article'
import ArticleCard from '@/components/article/ArticleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { Article } from '@/types/article'

const route = useRoute()
const router = useRouter()

const keywordInput = ref('')
const activeKeyword = ref('')
const results = ref<Article[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => Boolean(activeKeyword.value) && !isLoading.value && !allLoaded.value)

function resetPagination(): void {
  results.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

async function loadMore(): Promise<void> {
  if (!activeKeyword.value || isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const pageResult = await searchArticles(activeKeyword.value, page.value, pageSize)
    const records = pageResult.records ?? []

    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    results.value.push(...records)
    page.value += 1
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Search request failed.'
    }
  } finally {
    isLoading.value = false
  }
}

async function syncKeywordFromRoute(): Promise<void> {
  const routeKeyword = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  keywordInput.value = routeKeyword
  activeKeyword.value = routeKeyword
  resetPagination()

  if (activeKeyword.value) {
    await loadMore()
  }
}

async function submitSearch(): Promise<void> {
  await router.push({
    name: 'search',
    query: keywordInput.value ? { q: keywordInput.value } : {},
  })
}

watch(
  () => route.query.q,
  () => {
    void syncKeywordFromRoute()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMore, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.search-page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

.search-form {
  margin-top: 0.7rem;
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
  padding: 0.6rem 1rem;
  background: var(--color-text);
  color: var(--color-surface);
  cursor: pointer;
}

.hint,
.end-text {
  margin: 0;
  color: var(--color-muted);
}

.result-list {
  display: grid;
  gap: 0.8rem;
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

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .search-form {
    flex-direction: column;
  }
}
</style>
