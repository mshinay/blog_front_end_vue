<template>
  <section class="panel-card articles-panel">
    <div class="page-header">
      <p class="page-eyebrow">{{ t('personArticles.header.eyebrow') }}</p>
      <h2>{{ t('personArticles.header.title') }}</h2>
      <p>{{ t('personArticles.header.description') }}</p>
    </div>

    <form class="content-card articles-search" @submit.prevent="submitSearch">
      <label class="articles-search__field" for="person-article-search">
        <span>{{ t('personArticles.search.label') }}</span>
        <input
          id="person-article-search"
          v-model.trim="keywordInput"
          class="ui-input"
          type="text"
          :placeholder="t('personArticles.search.placeholder')"
        />
      </label>
      <div class="articles-search__actions">
        <button type="submit">{{ t('personArticles.search.submit') }}</button>
        <button type="button" class="secondary" @click="resetSearch">{{ t('personArticles.search.reset') }}</button>
      </div>
    </form>

    <div v-if="articles.length > 0" class="surface-stack">
      <article v-for="article in articles" :key="article.id" class="content-card article-item">
        <div class="article-item__header">
          <div class="article-item__copy">
            <RouterLink class="article-item__title" :to="`/article/${article.id}`">{{ article.title }}</RouterLink>
            <p class="article-item__summary">{{ resolveSummary(article.summary) }}</p>
          </div>
          <span class="ui-pill ui-pill--status">
            {{ article.publishTime ?? t('personArticles.item.draftTimeUnavailable') }}
          </span>
        </div>

        <div class="article-item__footer">
          <p class="article-item__meta">{{ t('personArticles.item.meta') }}</p>
          <div class="article-item__actions">
            <RouterLink
              v-if="canEditArticle(authStore.currentUser, article)"
              class="btn secondary"
              :to="`/edit-article/${article.id}`"
            >
              {{ t('personArticles.item.edit') }}
            </RouterLink>
            <button
              v-if="canDeleteArticle(authStore.currentUser, article)"
              type="button"
              class="danger"
              :disabled="deletingId === article.id"
              @click="deleteOwnedArticle(article.id)"
            >
              {{ deletingId === article.id ? t('personArticles.item.deleting') : t('personArticles.item.delete') }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <EmptyState
      v-else-if="!isLoading && !errorMessage"
      :eyebrow="t('personArticles.empty.eyebrow')"
      :title="t('personArticles.empty.title')"
      :message="t('personArticles.empty.message')"
    />
    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button v-if="hasLoadError" type="button" class="secondary btn-sm" @click="retryLoadMore">
        {{ t('common.retry') }}
      </button>
    </p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && articles.length > 0" class="muted-text articles-panel__end">{{ t('personArticles.end') }}</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { deleteArticle, getArticleList } from '@/api/modules/article'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { ArticleListItem } from '@/types/article'
import { canDeleteArticle, canEditArticle } from '@/utils/permissions'

const authStore = useAuthStore()
const { t } = useI18n()
const pageSize = 10

const keywordInput = ref('')
const activeKeyword = ref('')
const articles = ref<ArticleListItem[]>([])
const page = ref(1)
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const deletingId = ref<number | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value && !hasLoadError.value)

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

function resolveSummary(summary?: string): string {
  if (summary) {
    return summary
  }

  return t('personArticles.item.noSummary')
}

function buildArticleQuery(authorId: number, currentPage: number) {
  return {
    authorId,
    page: currentPage,
    pageSize,
    ...(activeKeyword.value ? { keyword: activeKeyword.value } : {}),
  }
}

async function loadMore(): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = t('personArticles.errors.loginRequired')
    allLoaded.value = true
    return
  }

  if (isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()
  try {
    const result = await getArticleList(buildArticleQuery(userId, page.value))

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
      errorMessage.value = t('personArticles.errors.loadFailed')
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
  if (!confirm(t('personArticles.confirm.delete'))) {
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
      errorMessage.value = t('personArticles.errors.deleteFailed')
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
.articles-panel,
.articles-search,
.articles-search__field,
.article-item,
.article-item__copy {
  display: grid;
  gap: var(--space-16);
}

.articles-search__field > span {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  font-weight: 600;
}

.articles-search__actions,
.article-item__actions,
.article-item__footer {
  display: flex;
  align-items: center;
  gap: var(--space-12);
}

.article-item__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-16);
}

.article-item__title {
  font-size: var(--text-card-title);
  font-weight: 700;
  text-decoration: none;
}

.article-item__summary,
.article-item__meta {
  color: var(--color-muted);
}

.article-item__footer {
  justify-content: space-between;
  padding-top: var(--space-16);
  border-top: 1px solid var(--color-divider);
}

.articles-panel__end {
  text-align: center;
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .articles-search__actions,
  .article-item__header,
  .article-item__footer,
  .article-item__actions {
    display: grid;
  }

  .articles-search__actions > *,
  .article-item__actions > * {
    width: 100%;
  }
}
</style>
