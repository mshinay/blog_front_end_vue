<template>
  <section class="article-detail">
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <article v-else-if="article" class="article-card">
      <header class="article-header">
        <div>
          <h1>{{ article.title }}</h1>
          <p class="meta">
            by
            <RouterLink :to="`/user/${article.authorId}`">{{ article.authorName ?? 'Unknown author' }}</RouterLink>
            <span>{{ article.createTime ?? '' }}</span>
          </p>
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

      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="articleHtml" />
    </article>

    <CommentList v-if="article" :article-id="article.id" />
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
import type { Article } from '@/types/article'
import { canDeleteArticle, canEditArticle } from '@/utils/permissions'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const article = ref<Article | null>(null)
const isLoading = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')

const articleHtml = computed(() => renderMarkdown(article.value?.content ?? ''))
const canEditArticlePermission = computed(() => canEditArticle(authStore.currentUser, article.value))
const canDeleteArticlePermission = computed(() => canDeleteArticle(authStore.currentUser, article.value))

async function loadArticleDetail(): Promise<void> {
  const articleId = route.params.articleId
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

.content {
  margin-top: 1rem;
  line-height: 1.7;
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
}
</style>
