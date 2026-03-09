<template>
  <section class="main-page">
    <p v-if="route.query.denied === 'admin'" class="notice">Admin access is required for that page.</p>

    <header class="page-header">
      <h1>Latest Articles</h1>
      <p>Scroll to load more posts from the feed.</p>
    </header>

    <div v-if="articles.length > 0" class="article-list">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
    </div>

    <EmptyState
      v-else-if="!isLoading && !errorMessage"
      message="No articles available right now."
    />

    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button type="button" class="retry-btn" @click="loadMoreArticles">Retry</button>
    </p>

    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && articles.length > 0" class="end-text">You have reached the end.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { AppError } from '@/api/client'
import { getArticleList } from '@/api/modules/article'
import ArticleCard from '@/components/article/ArticleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { Article } from '@/types/article'

const route = useRoute()

const page = ref(1)
const pageSize = 10
const articles = ref<Article[]>([])
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)

async function loadMoreArticles(): Promise<void> {
  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const pageResult = await getArticleList(page.value, pageSize)
    const records = pageResult.records ?? []

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
      errorMessage.value = 'Failed to load articles.'
    }
  } finally {
    isLoading.value = false
  }
}

useInfiniteScroll(sentinelRef, loadMoreArticles, {
  enabled: observerEnabled,
})

loadMoreArticles()
</script>

<style scoped>
.main-page {
  display: grid;
  gap: 1rem;
}

.notice {
  margin: 0;
  border-radius: 12px;
  border: 1px solid #f0d7a6;
  background: #fff9ec;
  color: #8a5a00;
  padding: 0.75rem 1rem;
}

.page-header h1 {
  margin: 0;
  font-family: var(--font-display);
}

.page-header p {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
}

.article-list {
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

.end-text {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
}

.sentinel {
  height: 1px;
}
</style>
