<template>
  <section class="panel">
    <header>
      <h2>My Comments</h2>
      <p>Review and maintain your comment history.</p>
      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model.trim="keywordInput" type="text" placeholder="Search your comments" />
        <button type="submit">Search</button>
        <button type="button" class="ghost" @click="resetSearch">Reset</button>
      </form>
    </header>

    <ul v-if="comments.length > 0" class="list">
      <li v-for="comment in comments" :key="comment.id" class="item">
        <p class="meta">
          <RouterLink :to="`/article/${comment.articleId}`">Article #{{ comment.articleId }}</RouterLink>
          <span>{{ comment.createTime ?? '' }}</span>
        </p>

        <div v-if="editingId === comment.id" class="editor-wrap">
          <textarea v-model.trim="editingContent" rows="4" />
          <div class="editor-actions">
            <button type="button" class="ghost" @click="cancelEdit">Cancel</button>
            <button
              type="button"
              :disabled="savingId === comment.id"
              @click="saveEdit(comment.id)"
            >
              {{ savingId === comment.id ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>

        <template v-else>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="content" v-html="renderMarkdown(comment.content)" />
          <div class="actions">
            <button type="button" class="ghost" @click="startEdit(comment)">Edit</button>
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
      </li>
    </ul>

    <EmptyState v-else-if="!isLoading && !errorMessage" message="You have not posted comments yet." />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && comments.length > 0" class="end-text">No more comments.</p>
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

const keywordInput = ref('')
const activeKeyword = ref('')
const comments = ref<CommentItem[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const deletingId = ref<number | null>(null)
const editingId = ref<number | null>(null)
const savingId = ref<number | null>(null)
const editingContent = ref('')
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)

function resetState(): void {
  comments.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

async function loadMore(): Promise<void> {
  const userId = authStore.currentUser?.id
  if (!userId) {
    errorMessage.value = 'Please log in to view your comments.'
    allLoaded.value = true
    return
  }

  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
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
.panel {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
  display: grid;
  gap: 0.9rem;
}

h2 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.35rem 0 0;
  color: var(--color-muted);
}

.search-form {
  margin-top: 0.8rem;
  display: flex;
  gap: 0.6rem;
}

.search-form input {
  flex: 1;
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
}

.search-form button {
  border: 0;
  border-radius: 10px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

.search-form button.ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.item {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: #fcfdff;
  padding: 0.8rem;
  display: grid;
  gap: 0.55rem;
}

.meta {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.88rem;
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.meta a {
  text-decoration: none;
  font-weight: 600;
}

.content {
  line-height: 1.7;
}

.actions,
.editor-actions {
  display: flex;
  gap: 0.55rem;
}

button {
  border: 0;
  border-radius: 8px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

button.ghost {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
}

button.danger {
  background: #ffebe9;
  color: #9a2518;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.editor-wrap textarea {
  width: 100%;
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.55rem 0.7rem;
  resize: vertical;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 10px;
  background: #fff2f2;
  padding: 0.6rem 0.75rem;
}

.end-text {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .search-form {
    flex-wrap: wrap;
  }
}
</style>
