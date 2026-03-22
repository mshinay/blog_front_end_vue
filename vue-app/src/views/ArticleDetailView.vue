<template>
  <section class="article-detail">
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <article v-else-if="article" class="article-card">
      <header class="article-header">
        <div class="header-main">
          <h1>{{ article.title }}</h1>
          <p class="meta">
            by
            <RouterLink :to="authorProfileLink">{{ authorDisplayName }}</RouterLink>
            <span>{{ article.publishTime ?? '' }}</span>
            <span v-if="article.updatedTime">Updated {{ article.updatedTime }}</span>
          </p>
          <p v-if="article.summary" class="summary">{{ article.summary }}</p>
          <div class="taxonomy">
            <span v-if="article.category" class="taxonomy-item">
              Category: {{ article.category.name }}
            </span>
            <span v-for="tag in article.tags ?? []" :key="tag.id" class="taxonomy-item">
              #{{ tag.name }}
            </span>
          </div>
        </div>

        <div class="action-group">
          <RouterLink
            v-if="canEditArticlePermission"
            class="edit-link"
            :to="`/edit-article/${article.id}`"
          >
            Edit Article
          </RouterLink>
          <button
            v-if="canDeleteArticlePermission"
            type="button"
            class="delete-btn"
            :disabled="isDeleting"
            @click="handleDeleteArticle"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete Article' }}
          </button>
        </div>
      </header>

      <dl class="stats-list">
        <div class="stats-item">
          <dt>Views</dt>
          <dd>{{ article.stats?.viewCount ?? 0 }}</dd>
        </div>
        <div class="stats-item">
          <dt>Likes</dt>
          <dd>{{ article.stats?.likeCount ?? 0 }}</dd>
        </div>
        <div class="stats-item">
          <dt>Comments</dt>
          <dd>{{ article.stats?.commentCount ?? 0 }}</dd>
        </div>
        <div class="stats-item">
          <dt>Favorites</dt>
          <dd>{{ article.stats?.favoriteCount ?? 0 }}</dd>
        </div>
      </dl>

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="articleHtml" />
    </article>

    <p v-if="article && !isCommentEnabled" class="comment-disabled">
      Comments are disabled for this article.
    </p>
    <CommentList v-else-if="article" :article-id="article.id" />
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
  display: grid;
  gap: 1rem;
}

.article-card {
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
}

.article-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.header-main {
  min-width: 0;
}

.action-group {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

.meta {
  margin: 0.55rem 0 0;
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta a {
  text-decoration: none;
  font-weight: 700;
}

.summary {
  margin: 0.75rem 0 0;
  color: var(--color-muted);
  line-height: 1.6;
}

.taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.taxonomy-item {
  border-radius: 999px;
  background: #edf3fb;
  color: #1f4f92;
  padding: 0.2rem 0.65rem;
  font-size: 0.85rem;
}

.edit-link {
  text-decoration: none;
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
  padding: 0.35rem 0.8rem;
}

.delete-btn {
  border: 0;
  border-radius: 999px;
  background: #ffebe9;
  color: #9a2518;
  padding: 0.4rem 0.85rem;
  cursor: pointer;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.stats-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1rem 0 0;
}

.stats-item {
  border-radius: 14px;
  border: 1px solid var(--color-border);
  background: #f8fafc;
  padding: 0.75rem;
}

.stats-item dt {
  color: var(--color-muted);
  font-size: 0.85rem;
}

.stats-item dd {
  margin: 0.35rem 0 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.content {
  margin-top: 1rem;
  line-height: 1.7;
}

.comment-disabled {
  margin: 0;
  border-radius: 12px;
  border: 1px solid #d7e3f3;
  background: #f7fbff;
  color: #1f4f92;
  padding: 0.75rem 1rem;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 12px;
  background: #fff2f2;
  padding: 0.75rem;
}

@media (max-width: 768px) {
  .article-header {
    flex-direction: column;
  }

  .stats-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
