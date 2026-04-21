<template>
  <section class="panel-card comments-panel">
    <div class="page-header">
      <p class="page-eyebrow">Discussion Archive</p>
      <h2>My Comments</h2>
      <p>Review your discussion history, edit what you have written, and return to the articles behind each exchange.</p>
    </div>

    <form class="content-card comments-search" @submit.prevent="submitSearch">
      <label class="comments-search__field" for="person-comment-search">
        <span>Search your comments</span>
        <input
          id="person-comment-search"
          v-model.trim="keywordInput"
          class="ui-input"
          type="text"
          placeholder="Search your comments"
        />
      </label>
      <div class="comments-search__actions">
        <button type="submit">Search</button>
        <button type="button" class="secondary" @click="resetSearch">Reset</button>
      </div>
    </form>

    <div v-if="comments.length > 0" class="surface-stack">
      <article v-for="comment in comments" :key="comment.id" class="content-card comment-item">
        <p class="comment-item__meta">
          <RouterLink :to="`/article/${comment.articleId}`">Article #{{ comment.articleId }}</RouterLink>
          <span>{{ comment.createTime ?? '' }}</span>
        </p>

        <div v-if="editingId === comment.id" class="comment-item__editor">
          <textarea v-model.trim="editingContent" class="ui-textarea" rows="4" />
          <div class="comment-item__actions">
            <button type="button" class="secondary" @click="cancelEdit">Cancel</button>
            <button type="button" :disabled="savingId === comment.id" @click="saveEdit(comment.id)">
              {{ savingId === comment.id ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        <template v-else>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="comment-item__content" v-html="renderMarkdown(comment.content)" />
          <div class="comment-item__actions">
            <button type="button" class="secondary" @click="startEdit(comment)">Edit</button>
            <button
              type="button"
              class="danger"
              :disabled="deletingId === comment.id"
              @click="deleteOwnedComment(comment.id)"
            >
              {{ deletingId === comment.id ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </template>
      </article>
    </div>

    <EmptyState
      v-else-if="!isLoading && !errorMessage"
      eyebrow="No Discussion Yet"
      title="Your comment archive is empty."
      message="Once you join article discussions, your messages will appear here for revisits and edits."
    />
    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button v-if="hasLoadError" type="button" class="secondary btn-sm" @click="retryLoadMore">Retry</button>
    </p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && comments.length > 0" class="muted-text comments-panel__end">No more comments.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppError } from '@/api/client'
import {
  deleteComment,
  getUserCommentList,
  searchUserComments,
  updateComment,
} from '@/api/modules/comment'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { CommentItem } from '@/types/comment'
import { renderMarkdown } from '@/utils/markdown'

const authStore = useAuthStore()
// API note: user-comment listing/search still depends on legacy endpoints because
// the standardized interface docs do not define an equivalent user-comment list API.

const keywordInput = ref('')
const activeKeyword = ref('')
const comments = ref<CommentItem[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const deletingId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const savingId = ref<number | null>(null)
const editingContent = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value && !hasLoadError.value)

function resetState(): void {
  comments.value = []
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

async function loadMore(): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = 'Please log in to view your comments.'
    allLoaded.value = true
    return
  }

  if (isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()
  try {
    const result = activeKeyword.value
      ? await searchUserComments(userId, activeKeyword.value, page.value, pageSize)
      : await getUserCommentList(userId, page.value, pageSize)

    const records = result.records ?? []
    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    comments.value.push(...records)
    page.value += 1
  } catch (error) {
    hasLoadError.value = true
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load your comments.'
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

function startEdit(comment: CommentItem): void {
  editingId.value = comment.id
  editingContent.value = comment.content
}

function cancelEdit(): void {
  editingId.value = null
  editingContent.value = ''
}

async function saveEdit(commentId: number): Promise<void> {
  const content = editingContent.value.trim()
  if (!content) {
    errorMessage.value = 'Comment content cannot be empty.'
    return
  }

  savingId.value = commentId
  errorMessage.value = ''
  try {
    const updated = await updateComment({ id: commentId, content })
    const index = comments.value.findIndex((item) => item.id === commentId)
    if (index >= 0) {
      comments.value[index] = { ...comments.value[index], ...updated }
    }
    cancelEdit()
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to update comment.'
    }
  } finally {
    savingId.value = null
  }
}

async function deleteOwnedComment(commentId: number): Promise<void> {
  if (!confirm('Delete this comment?')) {
    return
  }

  deletingId.value = commentId
  errorMessage.value = ''
  try {
    await deleteComment(commentId)
    comments.value = comments.value.filter((item) => item.id !== commentId)
    if (editingId.value === commentId) {
      cancelEdit()
    }
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to delete comment.'
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
.comments-panel,
.comments-search,
.comments-search__field,
.comment-item,
.comment-item__editor {
  display: grid;
  gap: var(--space-16);
}

.comments-search__field > span {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  font-weight: 600;
}

.comments-search__actions,
.comment-item__actions,
.comment-item__meta {
  display: flex;
  align-items: center;
  gap: var(--space-12);
}

.comment-item__meta {
  justify-content: space-between;
  flex-wrap: wrap;
  color: var(--color-muted);
  font-size: var(--text-meta);
}

.comment-item__meta a {
  text-decoration: none;
  font-weight: 700;
}

.comment-item__content {
  line-height: var(--line-reading);
}

.comments-panel__end {
  text-align: center;
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .comments-search__actions,
  .comment-item__actions {
    display: grid;
  }

  .comments-search__actions > *,
  .comment-item__actions > * {
    width: 100%;
  }
}
</style>
