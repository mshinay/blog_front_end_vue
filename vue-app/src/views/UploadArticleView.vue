<template>
  <section class="upload-page">
    <header>
      <h1>Create Article</h1>
      <p>Write in Markdown with split preview mode.</p>
    </header>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <article class="editor-card">
      <ArticleEditor
        :categories="categories"
        :tags="tags"
        :require-full-payload="true"
        submit-text="Publish"
        submitting-text="Publishing..."
        :loading="isBootstrapping"
        :submitting="isSubmitting"
        @submit="handlePublish"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { createArticle } from '@/api/modules/article'
import { getCategoryList } from '@/api/modules/category'
import { getTagList } from '@/api/modules/tag'
import ArticleEditor from '@/components/article/ArticleEditor.vue'
import type { CategoryListItem } from '@/types/category'
import type { ArticlePayload } from '@/types/article'
import type { TagListItem } from '@/types/tag'

interface BasicArticleSubmitPayload {
  title: string
  content: string
}

const router = useRouter()
const categories = ref<CategoryListItem[]>([])
const tags = ref<TagListItem[]>([])
const isBootstrapping = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function loadEditorOptions(): Promise<void> {
  isBootstrapping.value = true
  errorMessage.value = ''

  try {
    const [categoryResult, tagResult] = await Promise.all([getCategoryList(), getTagList()])
    categories.value = categoryResult.records ?? []
    tags.value = tagResult.records ?? []
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load category and tag options.'
    }
  } finally {
    isBootstrapping.value = false
  }
}

function isArticlePayload(payload: ArticlePayload | BasicArticleSubmitPayload): payload is ArticlePayload {
  return 'slug' in payload
}

async function handlePublish(payload: ArticlePayload | BasicArticleSubmitPayload): Promise<void> {
  if (!isArticlePayload(payload)) {
    errorMessage.value = 'Publish form is incomplete.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const articleId = await createArticle(payload)
    if (typeof articleId === 'number' && articleId > 0) {
      await router.push(`/article/${articleId}`)
      return
    }

    errorMessage.value = 'Publish succeeded but article id is invalid.'
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to publish article.'
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadEditorOptions()
})
</script>

<style scoped>
.upload-page {
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
