<template>
  <section class="main-page page-shell page-shell--wide">
    <p v-if="route.query.denied === 'admin'" class="notice-card">
      {{ t('main.deniedAdmin') }}
    </p>

    <section class="hero-section hero-surface">
      <div class="hero-section__intro">
        <span class="page-eyebrow">{{ t('main.heroEyebrow') }}</span>
        <h1>{{ t('main.heroTitle') }}</h1>
        <p>{{ t('main.heroDescription') }}</p>

        <div class="hero-section__actions">
          <RouterLink class="btn" to="/search">{{ t('main.heroExplore') }}</RouterLink>
          <RouterLink class="btn secondary" to="/upload">{{ t('main.heroWrite') }}</RouterLink>
        </div>

        <div class="hero-section__stats panel-grid">
          <div v-for="item in heroStats" :key="item.label" class="stats-tile">
            <span class="page-eyebrow">{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <span class="muted-text">{{ item.description }}</span>
          </div>
        </div>
      </div>

      <div class="hero-section__feature">
        <ArticleCard
          v-if="featuredArticle"
          :article="featuredArticle"
          variant="featured"
        />
        <div v-else class="content-card hero-section__placeholder">
          <span class="page-eyebrow">{{ t('main.featureLoadingEyebrow') }}</span>
          <h2>{{ t('main.featureLoadingTitle') }}</h2>
          <p>{{ t('main.featureLoadingDescription') }}</p>
        </div>
      </div>
    </section>

    <section class="feed-section page-section">
      <header class="page-header feed-section__header">
        <span class="page-eyebrow">{{ t('main.feedEyebrow') }}</span>
        <h2>{{ t('main.feedTitle') }}</h2>
        <p>{{ t('main.feedDescription') }}</p>
      </header>

      <div v-if="remainingArticles.length > 0" class="article-list">
        <ArticleCard
          v-for="(article, index) in remainingArticles"
          :key="article.id"
          :article="article"
          :variant="feedCardVariant(index)"
          :class="`article-list__item article-list__item--${feedCardVariant(index)}`"
        />
      </div>

      <EmptyState
        v-else-if="!isLoading && !errorMessage && !featuredArticle"
        :message="t('main.emptyMessage')"
      />

      <p v-if="errorMessage" class="error-text">
        <span>{{ errorMessage }}</span>
        <button
          v-if="hasLoadError"
          type="button"
          class="btn secondary btn-sm retry-btn"
          @click="retryLoadMoreArticles"
        >
          {{ t('common.retry') }}
        </button>
      </p>

      <LoadingState v-if="isLoading" />

      <p v-if="allLoaded && articles.length > 0" class="end-text">
        {{ t('main.endOfFeed') }}
      </p>
      <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { getArticleList } from '@/api/modules/article'
import ArticleCard from '@/components/article/ArticleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { ArticleListItem } from '@/types/article'

const { t } = useI18n()
const route = useRoute()

const page = ref(1)
const pageSize = 10
const articles = ref<ArticleListItem[]>([])
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value && !hasLoadError.value)
const articleFilters = computed(() => ({
  categoryId: resolveNumberQuery(route.query.categoryId),
  tagId: resolveNumberQuery(route.query.tagId),
  authorId: resolveNumberQuery(route.query.authorId),
  slug: resolveStringQuery(route.query.slug),
  keyword: resolveStringQuery(route.query.keyword) ?? resolveStringQuery(route.query.q),
}))

const featuredArticle = computed(() => articles.value[0] ?? null)
const remainingArticles = computed(() => articles.value.slice(1))
const loadedCategoryCount = computed(() => {
  const categories = new Set(
    articles.value.map((article) => article.categoryName).filter((value): value is string => Boolean(value)),
  )

  return categories.size
})
const loadedTopicCount = computed(() => {
  const tags = new Set(
    articles.value.flatMap((article) => article.tagList?.map((tag) => tag.name) ?? []),
  )

  return tags.size
})
const heroStats = computed(() => [
  {
    label: t('main.statStoriesLabel'),
    value: String(articles.value.length),
    description: t('main.statStoriesDescription'),
  },
  {
    label: t('main.statCategoriesLabel'),
    value: String(loadedCategoryCount.value),
    description: t('main.statCategoriesDescription'),
  },
  {
    label: t('main.statTopicsLabel'),
    value: String(loadedTopicCount.value),
    description: t('main.statTopicsDescription'),
  },
])

function resolveStringQuery(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim()
  }

  return undefined
}

function resolveNumberQuery(value: unknown): number | undefined {
  if (typeof value !== 'string' || !value.trim()) {
    return undefined
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function feedCardVariant(index: number): 'default' | 'compact' {
  return index % 4 === 1 || index % 4 === 2 ? 'compact' : 'default'
}

function resetArticleList(): void {
  page.value = 1
  articles.value = []
  allLoaded.value = false
  errorMessage.value = ''
  hasLoadError.value = false
}

function clearLoadError(): void {
  errorMessage.value = ''
  hasLoadError.value = false
}

function retryLoadMoreArticles(): void {
  clearLoadError()
  void loadMoreArticles()
}

async function loadMoreArticles(): Promise<void> {
  if (isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()

  try {
    const pageResult = await getArticleList(page.value, pageSize, articleFilters.value)
    const records = pageResult.records ?? []

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
      errorMessage.value = t('errors.loadArticlesFailed')
    }
  } finally {
    isLoading.value = false
  }
}

useInfiniteScroll(sentinelRef, loadMoreArticles, {
  enabled: observerEnabled,
})

watch(
  articleFilters,
  () => {
    resetArticleList()
    void loadMoreArticles()
  },
  { immediate: true },
)
</script>

<style scoped>
.main-page {
  gap: var(--space-32);
}

.hero-section {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  align-items: start;
  gap: clamp(var(--space-24), 4vw, var(--space-40));
}

.hero-section__intro {
  display: grid;
  gap: var(--space-20);
}

.hero-section__intro > p {
  max-width: 36rem;
  color: var(--color-muted);
  font-size: var(--text-body-lg);
}

.hero-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-10);
}

.hero-section__stats {
  margin-top: var(--space-8);
}

.hero-section__feature {
  min-width: 0;
}

.hero-section__placeholder {
  display: grid;
  gap: var(--space-12);
  min-height: 100%;
}

.hero-section__placeholder p {
  color: var(--color-muted);
}

.feed-section {
  gap: var(--space-20);
}

.feed-section__header {
  max-width: 44rem;
}

.article-list {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--space-16);
}

.article-list__item {
  grid-column: span 12;
}

.article-list__item--default {
  grid-column: span 7;
}

.article-list__item--compact {
  grid-column: span 5;
}

.error-text {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-12);
}

.retry-btn {
  flex: 0 0 auto;
}

.end-text {
  text-align: center;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.sentinel {
  height: 1px;
}

@media (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr;
  }

  .article-list__item,
  .article-list__item--default,
  .article-list__item--compact {
    grid-column: span 12;
  }
}

@media (max-width: 640px) {
  .hero-section__actions {
    display: grid;
  }

  .hero-section__actions > * {
    width: 100%;
  }

  .error-text {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
