<template>
  <section class="edit-page">
    <header>
      <h1>{{ t('edit.title') }}</h1>
      <p>{{ t('edit.description') }}</p>
    </header>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-else-if="isLoading" />

    <article v-else-if="article" class="editor-card">
      <ArticleEditor
        :initial-title="article.title"
        :initial-slug="article.slug ?? ''"
        :initial-summary="article.summary ?? ''"
        :initial-cover-url="article.coverUrl ?? ''"
        :initial-content="article.content ?? ''"
        :initial-category-id="article.category?.id ?? null"
        :initial-tag-ids="article.tags?.map((tag) => tag.id) ?? []"
        :initial-allow-comment="article.allowComment ?? 1"
        :initial-status="article.status ?? 1"
        :categories="resolvedCategories"
        :tags="resolvedTags"
        :require-full-payload="true"
        :submit-text="t('edit.actions.saveChanges')"
        :submitting-text="t('edit.actions.saving')"
        :submitting="isSubmitting"
        :show-cancel="true"
        @submit="handleUpdate"
        @cancel="handleCancel"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { AppError } from '@/api/client'
import { getArticleDetail, updateArticle } from '@/api/modules/article'
import ArticleEditor, { type BasicArticleSubmitPayload } from '@/components/article/ArticleEditor.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useAuthStore } from '@/stores/auth'
import type { Article, ArticlePayload } from '@/types/article'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const article = ref<Article | null>(null)
const isLoading = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const resolvedCategories = computed(() => (article.value?.category ? [article.value.category] : []))
const resolvedTags = computed(() => article.value?.tags ?? [])

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
  article.value = null

  if (!articleId) {
    errorMessage.value = t('edit.errors.invalidId')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const detail = await getArticleDetail(articleId)
    const currentUserId = authStore.currentUser?.id

    if (!currentUserId || currentUserId !== detail.author?.id) {
      errorMessage.value = t('edit.errors.noPermission')
      article.value = null
      await router.push(`/article/${articleId}`)
      return
    }

    article.value = detail
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('edit.errors.loadFailed')
    }
  } finally {
    isLoading.value = false
  }
}

function isArticlePayload(payload: ArticlePayload | BasicArticleSubmitPayload): payload is ArticlePayload {
  return 'slug' in payload
}

async function handleUpdate(payload: ArticlePayload | BasicArticleSubmitPayload): Promise<void> {
  if (!article.value) {
    return
  }

  if (!isArticlePayload(payload)) {
    errorMessage.value = t('edit.errors.payloadIncomplete')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await updateArticle({
      id: article.value.id,
      ...payload,
    })

    await router.push(`/article/${article.value.id}`)
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('edit.errors.saveFailed')
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
