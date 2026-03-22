<template>
  <form class="editor-shell" @submit.prevent="handleSubmit">
    <div class="field-block">
      <label for="article-title">Title</label>
      <input
        id="article-title"
        v-model.trim="title"
        type="text"
        placeholder="Enter article title"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-slug">Slug</label>
      <input
        id="article-slug"
        v-model.trim="slug"
        type="text"
        placeholder="Enter article slug"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-summary">Summary</label>
      <textarea
        id="article-summary"
        v-model.trim="summary"
        rows="3"
        placeholder="Enter article summary"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-cover">Cover URL</label>
      <input
        id="article-cover"
        v-model.trim="coverUrl"
        type="url"
        placeholder="Enter cover image URL"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-grid">
      <div class="field-block">
        <label for="article-category">Category</label>
        <select
          id="article-category"
          v-model="categoryId"
          :disabled="submitting || loading"
        >
          <option :value="null">Select a category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="field-block">
        <label for="article-status">Status</label>
        <select
          id="article-status"
          v-model="status"
          :disabled="submitting || loading"
        >
          <option :value="1">Published</option>
          <option :value="0">Draft</option>
        </select>
      </div>
    </div>

    <div v-if="requireFullPayload" class="field-grid">
      <div class="field-block">
        <label for="article-tags">Tags</label>
        <select
          id="article-tags"
          multiple
          :disabled="submitting || loading"
          @change="handleTagIdsChange"
        >
          <option
            v-for="tag in tags"
            :key="tag.id"
            :value="tag.id"
            :selected="tagIds.includes(tag.id)"
          >
            {{ tag.name }}
          </option>
        </select>
      </div>

      <div class="field-block field-toggle">
        <label for="article-allow-comment">Allow Comments</label>
        <select
          id="article-allow-comment"
          v-model="allowComment"
          :disabled="submitting || loading"
        >
          <option :value="1">Enabled</option>
          <option :value="0">Disabled</option>
        </select>
      </div>
    </div>

    <div class="field-block">
      <label>Content</label>
      <ByteMdEditor
        :value="content"
        :plugins="plugins"
        mode="split"
        :read-only="submitting || loading"
        @change="handleContentChange"
      />
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <div class="actions">
      <button type="submit" :disabled="submitting || loading">
        {{ submitting ? submittingText : submitText }}
      </button>
      <button
        v-if="showCancel"
        type="button"
        class="ghost"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'

import type { CategoryListItem } from '@/types/category'
import type { ArticlePayload } from '@/types/article'
import type { TagListItem } from '@/types/tag'

export interface BasicArticleSubmitPayload {
  title: string
  content: string
}

type CommentPermissionValue = ArticlePayload['allowComment']
type ArticleStatusValue = ArticlePayload['status']

const ByteMdEditor = defineAsyncComponent(async () => {
  const module = (await import('@bytemd/vue-next')) as unknown as {
    Editor: never
  }
  return module.Editor
})

const props = withDefaults(
  defineProps<{
    initialTitle?: string
    initialSlug?: string
    initialSummary?: string
    initialCoverUrl?: string
    initialContent?: string
    initialCategoryId?: number | null
    initialTagIds?: number[]
    initialAllowComment?: number
    initialStatus?: number
    categories?: CategoryListItem[]
    tags?: TagListItem[]
    requireFullPayload?: boolean
    submitText?: string
    submittingText?: string
    loading?: boolean
    submitting?: boolean
    showCancel?: boolean
  }>(),
  {
    initialTitle: '',
    initialSlug: '',
    initialSummary: '',
    initialCoverUrl: '',
    initialContent: '',
    initialCategoryId: null,
    initialTagIds: () => [],
    initialAllowComment: 1,
    initialStatus: 1,
    categories: () => [],
    tags: () => [],
    requireFullPayload: false,
    submitText: 'Save Article',
    submittingText: 'Saving...',
    loading: false,
    submitting: false,
    showCancel: false,
  },
)

const emit = defineEmits<{
  submit: [payload: ArticlePayload | BasicArticleSubmitPayload]
  cancel: []
}>()

const title = ref(props.initialTitle)
const slug = ref(props.initialSlug)
const summary = ref(props.initialSummary)
const coverUrl = ref(props.initialCoverUrl)
const content = ref(props.initialContent)
const categoryId = ref<number | null>(props.initialCategoryId)
const tagIds = ref<number[]>([...props.initialTagIds])
const allowComment = ref<CommentPermissionValue>(props.initialAllowComment as CommentPermissionValue)
const status = ref<ArticleStatusValue>(props.initialStatus as ArticleStatusValue)
const errorMessage = ref('')
const plugins = [gfm(), highlight()]

watch(
  () => props.initialTitle,
  (value) => {
    title.value = value
  },
)

watch(
  () => props.initialSlug,
  (value) => {
    slug.value = value
  },
)

watch(
  () => props.initialSummary,
  (value) => {
    summary.value = value
  },
)

watch(
  () => props.initialCoverUrl,
  (value) => {
    coverUrl.value = value
  },
)

watch(
  () => props.initialContent,
  (value) => {
    content.value = value
  },
)

watch(
  () => props.initialCategoryId,
  (value) => {
    categoryId.value = value
  },
)

watch(
  () => props.initialTagIds,
  (value) => {
    tagIds.value = [...value]
  },
)

watch(
  () => props.initialAllowComment,
  (value) => {
    allowComment.value = value as CommentPermissionValue
  },
)

watch(
  () => props.initialStatus,
  (value) => {
    status.value = value as ArticleStatusValue
  },
)

function handleContentChange(nextValue: string) {
  content.value = nextValue
}

function handleTagIdsChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  tagIds.value = Array.from(target.selectedOptions, (option) => Number(option.value)).filter((id) =>
    Number.isFinite(id),
  )
}

function handleSubmit(): void {
  if (!title.value.trim()) {
    errorMessage.value = 'Title cannot be empty.'
    return
  }

  if (!content.value.trim()) {
    errorMessage.value = 'Content cannot be empty.'
    return
  }

  if (!props.requireFullPayload) {
    errorMessage.value = ''
    emit('submit', {
      title: title.value.trim(),
      content: content.value.trim(),
    })
    return
  }

  if (!slug.value.trim()) {
    errorMessage.value = 'Slug cannot be empty.'
    return
  }

  if (!summary.value.trim()) {
    errorMessage.value = 'Summary cannot be empty.'
    return
  }

  if (!coverUrl.value.trim()) {
    errorMessage.value = 'Cover URL cannot be empty.'
    return
  }

  if (!categoryId.value) {
    errorMessage.value = 'Please select a category.'
    return
  }

  errorMessage.value = ''
  emit('submit', {
    title: title.value.trim(),
    slug: slug.value.trim(),
    summary: summary.value.trim(),
    coverUrl: coverUrl.value.trim(),
    content: content.value.trim(),
    contentType: 'markdown',
    categoryId: categoryId.value,
    tagIds: [...tagIds.value],
    allowComment: allowComment.value,
    status: status.value,
  })
}
</script>

<style scoped>
.editor-shell {
  display: grid;
  gap: 0.9rem;
}

.field-block {
  display: grid;
  gap: 0.45rem;
}

.field-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label {
  font-weight: 700;
}

input,
textarea,
select {
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  font: inherit;
}

textarea,
select[multiple] {
  resize: vertical;
  min-height: 120px;
}

.field-toggle select {
  min-height: auto;
}

.actions {
  display: flex;
  gap: 0.6rem;
}

button {
  border: 0;
  border-radius: 10px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

button.ghost {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
}

@media (max-width: 768px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
