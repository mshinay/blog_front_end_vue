<template>
  <form class="editor-shell" @submit.prevent="handleSubmit">
    <div class="field-block">
      <label for="article-title">{{ t('editor.fields.title') }}</label>
      <input
        id="article-title"
        v-model.trim="title"
        type="text"
        :placeholder="t('editor.placeholders.title')"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-slug">{{ t('editor.fields.slug') }}</label>
      <input
        id="article-slug"
        v-model.trim="slug"
        type="text"
        :placeholder="t('editor.placeholders.slug')"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-summary">{{ t('editor.fields.summary') }}</label>
      <textarea
        id="article-summary"
        v-model.trim="summary"
        rows="3"
        :placeholder="t('editor.placeholders.summary')"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-block">
      <label for="article-cover">{{ t('editor.fields.coverUrl') }}</label>
      <input
        id="article-cover"
        v-model.trim="coverUrl"
        type="url"
        :placeholder="t('editor.placeholders.coverUrl')"
        :disabled="submitting || loading"
      />
    </div>

    <div v-if="requireFullPayload" class="field-grid">
      <div class="field-block">
        <label for="article-category">{{ t('editor.fields.category') }}</label>
        <select
          id="article-category"
          v-model="categoryId"
          :disabled="submitting || loading"
        >
          <option :value="null">{{ t('editor.options.selectCategory') }}</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div class="field-block">
        <label for="article-status">{{ t('editor.fields.status') }}</label>
        <select
          id="article-status"
          v-model="status"
          :disabled="submitting || loading"
        >
          <option :value="1">{{ t('editor.options.published') }}</option>
          <option :value="0">{{ t('editor.options.draft') }}</option>
        </select>
      </div>
    </div>

    <div v-if="requireFullPayload" class="field-grid">
      <div class="field-block">
        <label for="article-tags">{{ t('editor.fields.tags') }}</label>
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
        <label for="article-allow-comment">{{ t('editor.fields.allowComments') }}</label>
        <select
          id="article-allow-comment"
          v-model="allowComment"
          :disabled="submitting || loading"
        >
          <option :value="1">{{ t('editor.options.enabled') }}</option>
          <option :value="0">{{ t('editor.options.disabled') }}</option>
        </select>
      </div>
    </div>

    <div class="field-block">
      <label>{{ t('editor.fields.content') }}</label>
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
        {{ submitting ? resolvedSubmittingText : resolvedSubmitText }}
      </button>
      <button
        v-if="showCancel"
        type="button"
        class="ghost"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
    submitText?: string | null
    submittingText?: string | null
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
    submitText: null,
    submittingText: null,
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
const { t } = useI18n()

const resolvedSubmitText = computed(() => props.submitText ?? t('editor.actions.saveArticle'))
const resolvedSubmittingText = computed(() => props.submittingText ?? t('editor.actions.saving'))

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
    errorMessage.value = t('editor.errors.titleEmpty')
    return
  }

  if (!content.value.trim()) {
    errorMessage.value = t('editor.errors.contentEmpty')
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
    errorMessage.value = t('editor.errors.slugEmpty')
    return
  }

  if (!summary.value.trim()) {
    errorMessage.value = t('editor.errors.summaryEmpty')
    return
  }

  if (!coverUrl.value.trim()) {
    errorMessage.value = t('editor.errors.coverEmpty')
    return
  }

  if (!categoryId.value) {
    errorMessage.value = t('editor.errors.categoryRequired')
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
