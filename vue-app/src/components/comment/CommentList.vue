<template>
  <section class="comment-section">
    <header>
      <h2>Comments</h2>
      <p>{{ loadedCount }} loaded</p>
    </header>

    <CommentEditor
      v-if="authStore.isAuthenticated"
      submit-text="Post Comment"
      loading-text="Posting..."
      :loading="isCreating"
      :reset-key="editorResetKey"
      placeholder="Write your comment in Markdown..."
      @submit="createNewComment"
    />

    <p v-else class="hint">Log in to post comments.</p>

    <ul v-if="comments.length > 0" class="comment-list">
      <CommentItem
        v-for="commentNode in comments"
        :key="commentNode.comment.id"
        :comment="commentNode.comment"
        :children="commentNode.children"
        :can-edit="canCurrentUserEdit(commentNode.comment)"
        :can-delete="canCurrentUserDelete(commentNode.comment)"
        :is-saving="updatingId === commentNode.comment.id"
        :is-deleting="deletingId === commentNode.comment.id"
        :resolve-can-edit="canCurrentUserEdit"
        :resolve-can-delete="canCurrentUserDelete"
        :active-saving-id="updatingId"
        :active-deleting-id="deletingId"
        @update="updateExistingComment"
        @delete="deleteExistingComment"
      />
    </ul>

    <EmptyState
      v-else-if="!isLoading && !errorMessage"
      message="No comments yet. Start the discussion."
    />

    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button type="button" class="retry-btn" @click="loadMoreComments">Retry</button>
    </p>

    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && comments.length > 0" class="end-text">No more comments.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { AppError } from '@/api/client'
import { createComment, deleteComment, getCommentList, updateComment } from '@/api/modules/comment'
import CommentEditor from '@/components/comment/CommentEditor.vue'
import CommentItem from '@/components/comment/CommentItem.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { useAuthStore } from '@/stores/auth'
import type { CommentItem as CommentModel, CommentNode } from '@/types/comment'
import { canDeleteComment, canEditComment } from '@/utils/permissions'

const props = defineProps<{
  articleId: number
}>()

const authStore = useAuthStore()

const comments = ref<CommentNode[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const sentinelRef = ref<HTMLElement | null>(null)
const isCreating = ref(false)
const updatingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const editorResetKey = ref(0)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)
const loadedCount = computed(() =>
  comments.value.reduce((count, node) => count + 1 + node.children.length, 0),
)

function resetState(): void {
  comments.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

function canCurrentUserEdit(comment: CommentModel): boolean {
  return canEditComment(authStore.currentUser, comment)
}

function canCurrentUserDelete(comment: CommentModel): boolean {
  return canDeleteComment(authStore.currentUser, comment)
}

async function loadMoreComments(): Promise<void> {
  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const pageResult = await getCommentList(props.articleId, page.value, pageSize)
    const records = pageResult.records ?? []

    if (records.length === 0) {
      allLoaded.value = true
      return
    }

    comments.value.push(
      ...records
        .filter((record) => Boolean(record.comment))
        .map((record) => ({
          comment: record.comment,
          children: record.children ?? [],
        })),
    )
    page.value += 1
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to load comments.'
    }
  } finally {
    isLoading.value = false
  }
}

async function createNewComment(content: string): Promise<void> {
  if (!authStore.isAuthenticated) {
    errorMessage.value = 'Please log in before posting comments.'
    return
  }

  isCreating.value = true
  errorMessage.value = ''

  try {
    await createComment({
      articleId: props.articleId,
      parentId: 0,
      rootId: 0,
      replyUserId: 0,
      replyToCommentId: 0,
      content,
    })
    resetState()
    await loadMoreComments()
    editorResetKey.value += 1
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to post comment.'
    }
  } finally {
    isCreating.value = false
  }
}

async function updateExistingComment(payload: { id: number; content: string }): Promise<void> {
  updatingId.value = payload.id
  errorMessage.value = ''

  try {
    const updated = await updateComment(payload)
    comments.value = comments.value.map((node) => {
      if (node.comment.id === payload.id) {
        return {
          ...node,
          comment: { ...node.comment, ...updated },
        }
      }

      return {
        ...node,
        children: node.children.map((child) =>
          child.id === payload.id ? { ...child, ...updated } : child,
        ),
      }
    })
  } catch (error) {
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Failed to update comment.'
    }
  } finally {
    updatingId.value = null
  }
}

async function deleteExistingComment(commentId: number): Promise<void> {
  deletingId.value = commentId
  errorMessage.value = ''

  try {
    await deleteComment(commentId)
    comments.value = comments.value
      .filter((node) => node.comment.id !== commentId)
      .map((node) => ({
        ...node,
        children: node.children.filter((child) => child.id !== commentId),
      }))
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
  () => props.articleId,
  () => {
    resetState()
    void loadMoreComments()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMoreComments, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.comment-section {
  margin-top: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
}

header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
}

h2,
p {
  margin: 0;
}

header p,
.hint,
.end-text {
  color: var(--color-muted);
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.7rem;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 12px;
  background: #fff2f2;
  padding: 0.75rem;
}

.retry-btn {
  margin-left: 0.75rem;
  border: 0;
  border-radius: 8px;
  background: var(--color-text);
  color: var(--color-surface);
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.sentinel {
  height: 1px;
}
</style>
