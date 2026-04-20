<template>
  <section class="search-page page-shell page-shell--wide">
    <header class="hero-surface search-hero">
      <div class="search-hero__intro page-header">
        <span class="page-eyebrow">Discovery</span>
        <h1>Find the next article worth your attention.</h1>
        <p>
          Search stays lightweight, but the experience now gives clearer context for what you are
          looking for and what the current result set is telling you.
        </p>
      </div>

      <div class="panel-card search-panel">
        <form class="search-form" @submit.prevent="submitSearch">
          <label class="search-form__label" for="search-keyword">Search by keyword</label>
          <div class="search-form__controls">
            <input
              id="search-keyword"
              v-model.trim="keywordInput"
              class="ui-input ui-input--lg"
              type="text"
              placeholder="Try a topic, framework, or writing idea"
            />
            <button type="submit" class="btn btn-lg">Search</button>
          </div>
        </form>

        <dl class="search-stats">
          <div class="stats-tile">
            <dt>Query</dt>
            <dd>{{ activeKeyword || 'Ready' }}</dd>
          </div>
          <div class="stats-tile">
            <dt>Loaded</dt>
            <dd>{{ results.length }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <section class="panel-card search-results">
      <div class="search-results__header page-header">
        <span class="page-eyebrow">{{ resultEyebrow }}</span>
        <h2>{{ resultTitle }}</h2>
        <p>{{ resultDescription }}</p>
      </div>

      <EmptyState
        v-if="!activeKeyword && !isLoading"
        eyebrow="Start Here"
        title="Search becomes the page focal point instead of an empty utility row."
        message="Enter a keyword above to explore articles by topic, framework, or phrase."
      />

      <LoadingState
        v-else-if="isLoading && results.length === 0"
        eyebrow="Searching"
        title="Looking through the article archive."
        message="Results will appear here as soon as the first page comes back."
      />

      <div v-else-if="results.length > 0" class="search-feed surface-stack">
        <ArticleCard
          v-if="featuredResult"
          :article="featuredResult"
          variant="featured"
        />

        <div v-if="primaryResults.length > 0" class="search-grid search-grid--primary">
          <ArticleCard
            v-for="article in primaryResults"
            :key="article.id"
            :article="article"
            variant="default"
          />
        </div>

        <div v-if="secondaryResults.length > 0" class="search-grid search-grid--compact">
          <ArticleCard
            v-for="article in secondaryResults"
            :key="article.id"
            :article="article"
            variant="compact"
          />
        </div>
      </div>

      <EmptyState
        v-else-if="activeKeyword && !errorMessage"
        eyebrow="No Matches"
        title="No results found for this search yet."
        :message="emptyResultMessage"
      />

      <p v-if="errorMessage" class="error-text">
        {{ errorMessage }}
        <button v-if="hasLoadError" type="button" class="secondary btn-sm" @click="retryLoadMore">
          Retry
        </button>
      </p>

      <LoadingState
        v-if="isLoading && results.length > 0"
        class="search-results__loading"
        eyebrow="More Results"
        title="Loading another page of articles."
        message="The existing list stays in place while more results are fetched."
        compact
      />

      <p v-if="allLoaded && results.length > 0" class="end-text">
        You have reached the end of the results for "{{ activeKeyword }}".
      </p>

      <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { getArticleList } from '@/api/modules/article'
import ArticleCard from '@/components/article/ArticleCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { ArticleListItem } from '@/types/article'

const route = useRoute()
const router = useRouter()

const keywordInput = ref('')
const activeKeyword = ref('')
const results = ref<ArticleListItem[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(
  () => Boolean(activeKeyword.value) && !isLoading.value && !allLoaded.value && !hasLoadError.value,
)
const featuredResult = computed(() => results.value[0] ?? null)
const primaryResults = computed(() => results.value.slice(1, 3))
const secondaryResults = computed(() => results.value.slice(3))
const resultEyebrow = computed(() => {
  if (!activeKeyword.value) {
    return 'Search Studio'
  }

  return `${results.value.length} loaded for "${activeKeyword.value}"`
})
const resultTitle = computed(() => {
  if (!activeKeyword.value) {
    return 'Explore the archive with a direct, dedicated search tool.'
  }

  return `Results for "${activeKeyword.value}"`
})
const resultDescription = computed(() => {
  if (!activeKeyword.value) {
    return 'The query state, result rhythm, and empty states all live in the same editorial system as the homepage.'
  }

  if (results.value.length > 0) {
    return 'The first match gets a stronger lead treatment, while the remaining results keep a steady reading rhythm.'
  }

  return 'No matching articles have appeared yet, but the page still keeps the query context visible and intentional.'
})
const emptyResultMessage = computed(
  () => `Try refining "${activeKeyword.value}" with a broader phrase or a related topic.`,
)

function resetPagination(): void {
  results.value = []
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

async function loadMore(): Promise<void> {
  if (!activeKeyword.value || isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()

  try {
    const pageResult = await getArticleList(page.value, pageSize, {
      keyword: activeKeyword.value,
    })
    const records = pageResult.records ?? []

    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    results.value.push(...records)
    page.value += 1
  } catch (error) {
    hasLoadError.value = true
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
  padding-bottom: var(--space-48);
}

.search-hero {
  display: grid;
  gap: var(--space-24);
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
  align-items: start;
}

.search-panel,
.search-form,
.search-results {
  display: grid;
  gap: var(--space-16);
}

.search-form__label {
  font-size: var(--text-meta);
  font-weight: 700;
  color: var(--color-text-soft);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.search-form__controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--space-12);
  align-items: center;
}

.search-form__controls input {
  min-height: var(--control-height-lg);
}

.search-stats {
  display: grid;
  gap: var(--space-12);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
}

.search-stats dt {
  color: var(--color-muted);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
}

.search-stats dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.35rem, 3vw, 2rem);
  line-height: var(--line-tight);
  color: var(--color-text);
}

.search-results__header {
  max-width: 44rem;
}

.search-feed {
  gap: var(--space-20);
}

.search-grid {
  display: grid;
  gap: var(--space-16);
}

.search-grid--compact {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
}

.error-text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-12);
  margin: 0;
}

.search-results__loading {
  margin-top: calc(var(--space-8) * -1);
}

.end-text {
  margin: 0;
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.sentinel {
  height: 1px;
}

@media (max-width: 900px) {
  .search-hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .search-page {
    padding-bottom: var(--space-32);
  }

  .search-form__controls {
    grid-template-columns: 1fr;
  }

  .search-stats {
    grid-template-columns: 1fr;
  }
}
</style>
