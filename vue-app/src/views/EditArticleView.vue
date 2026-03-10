<template>
  <section class="edit-page">
    <header>
      <h1>Edit Article</h1>
      <p>Only the original author can edit this article.</p>
    </header>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <article v-else-if="article" class="editor-card">
      <ArticleEditor
        :initial-title="article.title"
        :initial-content="article.content ?? ''"
        submit-text="Save Changes"
        submitting-text="Saving..."
        :submitting="isSubmitting"
        :show-cancel="true"
        @submit="handleUpdate"
        @cancel="handleCancel"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { getArticleDetail, updateArticle } from '@/api/modules/article'
import ArticleEditor from '@/components/article/ArticleEditor.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/article'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const article = ref<Article | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

function currentArticleId(): number | null {
  const raw = route.params.articleId
  if (!raw) {
    return null
  }

  const num = Number(raw)
  return Number.isFinite(num) ? num : null
}

async function loadEditableArticle(): Promise<void> {
  const articleId = currentArticleId()
  if (!articleId) {
    errorMessage.value = 'Invalid article id.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const detail = await getArticleDetail(articleId)
    const currentUserId = authStore.currentUser?.id

    if (!currentUserId || currentUserId !== detail.authorId) {
      errorMessage.value = 'You do not have permission to edit this article.'
      article.value = null
      await router.push(`/article/${articleId}`)
      return
    }

    article.value = detail
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load editable article.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleUpdate(payload: { title: string; content: string }): Promise<void> {
  if (!article.value) {
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await updateArticle({
      id: article.value.id,
      title: payload.title,
      content: payload.content,
    })

    await router.push(`/article/${article.value.id}`)
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to save article changes.'
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handleCancel(): Promise<void> {
  if (!article.value) {
    await router.push('/main')
    return
  }

  await router.push(`/article/${article.value.id}`)
}

watch(
  () => route.params.articleId,
  () => {
    void loadEditableArticle()
  },
  { immediate: true },
)
</script>

<style scoped>
.edit-page {
  display: grid;
  gap: 0.9rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.45rem 0 0;
  color: var(--color-muted);
}

.editor-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 12px;
  background: #fff2f2;
  padding: 0.75rem;
}
</style>
