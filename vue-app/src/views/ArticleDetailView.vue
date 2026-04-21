<template>
  <section class="article-detail page-shell page-shell--wide">
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <template v-else-if="article">
      <article class="article-reading surface-stack">
        <header class="article-hero hero-surface">
          <div class="article-hero__main">
            <div class="page-header article-hero__intro">
              <span class="page-eyebrow">{{ categoryLabel }}</span>
              <h1 class="article-title">{{ article.title }}</h1>
              <p v-if="article.summary" class="article-summary">{{ article.summary }}</p>
            </div>

            <div class="article-meta panel-card">
              <div class="article-meta__lead">
                <p class="article-author">
                  Written by
                  <RouterLink :to="authorProfileLink">{{ authorDisplayName }}</RouterLink>
                </p>
                <p class="article-meta__dates">
                  <span v-if="publishLabel">{{ publishLabel }}</span>
                  <span v-if="article.updatedTime">Updated {{ article.updatedTime }}</span>
                </p>
              </div>

              <div class="article-taxonomy">
                <span v-if="article.category" class="pill ui-pill--category">
                  {{ article.category.name }}
                </span>
                <span v-if="article.wordCount" class="pill ui-pill--status">
                  {{ article.wordCount }} words
                </span>
                <span class="pill ui-pill--status">
                  {{ isCommentEnabled ? 'Comments open' : 'Comments closed' }}
                </span>
                <span
                  v-for="tag in article.tags ?? []"
                  :key="tag.id"
                  class="pill ui-pill--topic"
                >
                  #{{ tag.name }}
                </span>
              </div>
            </div>
          </div>

          <aside class="article-hero__aside">
            <div class="panel-card article-actions">
              <p class="article-actions__eyebrow page-eyebrow">Manage</p>
              <p class="article-actions__copy">
                Keep article actions nearby without pulling focus away from the reading flow.
              </p>
              <div class="article-actions__buttons">
                <RouterLink
                  v-if="canEditArticlePermission"
                  class="btn secondary btn-sm"
                  :to="`/edit-article/${article.id}`"
                >
                  Edit Article
                </RouterLink>
                <button
                  v-if="canDeleteArticlePermission"
                  type="button"
                  class="danger btn-sm"
                  :disabled="isDeleting"
                  @click="handleDeleteArticle"
                >
                  {{ isDeleting ? 'Deleting...' : 'Delete Article' }}
                </button>
              </div>
            </div>

            <dl class="article-stats">
              <div class="stats-tile">
                <dt>Views</dt>
                <dd>{{ article.stats?.viewCount ?? 0 }}</dd>
              </div>
              <div class="stats-tile">
                <dt>Likes</dt>
                <dd>{{ article.stats?.likeCount ?? 0 }}</dd>
              </div>
              <div class="stats-tile">
                <dt>Comments</dt>
                <dd>{{ article.stats?.commentCount ?? 0 }}</dd>
              </div>
              <div class="stats-tile">
                <dt>Favorites</dt>
                <dd>{{ article.stats?.favoriteCount ?? 0 }}</dd>
              </div>
            </dl>
          </aside>
        </header>

        <section class="content-card article-body">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="reading-column article-prose" v-html="articleHtml" />
        </section>
      </article>

      <section class="panel-card article-comments">
        <div class="page-header article-comments__header">
          <span class="page-eyebrow">Discussion</span>
          <h2>Join the conversation around this piece.</h2>
          <p>
            Reader responses stay attached to the article surface, with clear separation from the
            long-form reading column.
          </p>
        </div>

        <p v-if="!isCommentEnabled" class="notice-card">
          Comments are disabled for this article.
        </p>
        <CommentList v-else :article-id="article.id" embedded />
      </section>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { deleteArticle, getArticleDetail } from '@/api/modules/article'
import CommentList from '@/components/comment/CommentList.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'
import type { Article, ArticlePermissionTarget } from '@/types/article'
import { canDeleteArticle, canEditArticle } from '@/utils/permissions'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const article = ref<Article | null>(null)
const isLoading = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const articlePermissionTarget = computed<ArticlePermissionTarget | null>(() => {
  if (!article.value?.id || !article.value.author?.id) {
    return null
  }

  return {
    id: article.value.id,
    authorId: article.value.author.id,
  }
})
const articleHtml = computed(() => renderMarkdown(article.value?.content))
const authorDisplayName = computed(
  () => article.value?.author?.nickname || article.value?.author?.username || 'Unknown author',
)
const authorProfileLink = computed(() => `/user/${article.value?.author?.id ?? ''}`)
const isCommentEnabled = computed(() => article.value?.allowComment === 1)
const categoryLabel = computed(() => article.value?.category?.name || 'Editorial reading')
const publishLabel = computed(() => article.value?.publishTime || article.value?.createTime || '')
const canEditArticlePermission = computed(() =>
  canEditArticle(authStore.currentUser, articlePermissionTarget.value as Article | null),
)
const canDeleteArticlePermission = computed(() =>
  canDeleteArticle(authStore.currentUser, articlePermissionTarget.value as Article | null),
)

async function loadArticleDetail(): Promise<void> {
  const articleId = route.params.articleId
  article.value = null

  if (!articleId) {
    errorMessage.value = 'Missing article id.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    article.value = await getArticleDetail(String(articleId))
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load article detail.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleDeleteArticle(): Promise<void> {
  if (!article.value) {
    return
  }

  if (!confirm('Are you sure you want to delete this article?')) {
    return
  }

  isDeleting.value = true
  errorMessage.value = ''

  try {
    await deleteArticle(article.value.id)
    await router.push('/main')
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to delete article.'
    }
  } finally {
    isDeleting.value = false
  }
}

watch(
  () => route.params.articleId,
  () => {
    void loadArticleDetail()
  },
  { immediate: true },
)
</script>

<style scoped>
.article-detail {
  padding-bottom: var(--space-48);
}

.article-reading {
  gap: var(--space-24);
}

.article-hero {
  display: grid;
  gap: var(--space-24);
  grid-template-columns: minmax(0, 1.8fr) minmax(260px, 0.95fr);
  align-items: start;
}

.article-hero__main,
.article-hero__aside,
.article-hero__intro,
.article-meta,
.article-actions {
  display: grid;
  gap: var(--space-16);
}

.article-title {
  font-size: clamp(2.35rem, 4.6vw, 4rem);
  line-height: var(--line-tight);
}

.article-summary {
  max-width: 40rem;
  font-size: var(--text-body-lg);
  color: var(--color-text-soft);
  line-height: var(--line-body);
}

.article-meta {
  padding: var(--space-20);
}

.article-meta__lead {
  display: grid;
  gap: var(--space-8);
}

.article-author,
.article-meta__dates {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-8);
}

.article-author {
  color: var(--color-text-soft);
  font-size: var(--text-body-sm);
}

.article-author a {
  font-weight: 700;
  text-decoration: none;
}

.article-meta__dates {
  color: var(--color-muted);
  font-size: var(--text-meta);
}

.article-taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.article-actions {
  align-content: start;
}

.article-actions__eyebrow {
  margin: 0;
}

.article-actions__copy {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
}

.article-actions__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-10);
}

.article-stats {
  display: grid;
  gap: var(--space-12);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
}

.article-stats dt {
  color: var(--color-muted);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
}

.article-stats dd {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  line-height: var(--line-tight);
  color: var(--color-text);
}

.article-body {
  padding-block: clamp(var(--space-24), 4vw, var(--space-40));
}

.article-prose {
  color: var(--color-text);
  font-size: var(--text-body-lg);
}

.article-prose :deep(* + *) {
  margin-top: var(--space-20);
}

.article-prose:deep(h1),
.article-prose:deep(h2),
.article-prose:deep(h3),
.article-prose:deep(h4) {
  margin-top: var(--space-32);
  color: var(--color-text);
  font-family: var(--font-display);
  line-height: var(--line-heading);
}

.article-prose:deep(h1) {
  font-size: clamp(2rem, 4vw, 3rem);
}

.article-prose:deep(h2) {
  font-size: clamp(1.65rem, 3vw, 2.1rem);
}

.article-prose:deep(h3) {
  font-size: 1.35rem;
}

.article-prose:deep(p),
.article-prose:deep(li) {
  color: var(--color-text);
}

.article-prose:deep(ul),
.article-prose:deep(ol) {
  padding-left: 1.4em;
}

.article-prose:deep(blockquote) {
  border-left: 3px solid var(--color-accent-soft);
  padding: var(--space-12) 0 var(--space-12) var(--space-16);
  color: var(--color-text-soft);
  background: linear-gradient(90deg, rgba(234, 216, 203, 0.3) 0%, rgba(234, 216, 203, 0) 100%);
}

.article-prose:deep(pre) {
  overflow-x: auto;
  padding: var(--space-16);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-surface-soft) 82%, white);
}

.article-prose:deep(img) {
  border-radius: var(--radius-lg);
  margin-inline: auto;
  box-shadow: var(--shadow-soft);
}

.article-prose:deep(hr) {
  margin-block: var(--space-32);
}

.article-comments {
  gap: var(--space-20);
}

.article-comments__header {
  max-width: 42rem;
}

.article-comments :deep(.comment-list) {
  gap: var(--space-12);
}

.article-comments :deep(.sentinel) {
  margin-top: var(--space-8);
}

@media (max-width: 768px) {
  .article-detail {
    padding-bottom: var(--space-32);
  }

  .article-hero {
    grid-template-columns: 1fr;
  }

  .article-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .article-title {
    font-size: clamp(2rem, 11vw, 3rem);
  }
}

@media (max-width: 560px) {
  .article-stats {
    grid-template-columns: 1fr;
  }

  .article-actions__buttons {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
