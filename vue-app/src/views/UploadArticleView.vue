<template>
  <section class="upload-page">
    <header>
      <h1>Create Article</h1>
      <p>Write in Markdown with split preview mode.</p>
    </header>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <article class="editor-card">
      <ArticleEditor
        submit-text="Publish"
        submitting-text="Publishing..."
        :submitting="isSubmitting"
        @submit="handlePublish"
      />
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { createArticle } from '@/api/modules/article'
import ArticleEditor from '@/components/article/ArticleEditor.vue'

const router = useRouter()
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handlePublish(payload: { title: string; content: string }): Promise<void> {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const created = await createArticle(payload)
    if (created.id) {
      await router.push(`/article/${created.id}`)
      return
    }

    await router.push('/main')
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
