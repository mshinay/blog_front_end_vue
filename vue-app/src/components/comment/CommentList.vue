<template>
  <section class="comment-section panel-card" :class="{ 'comment-section--embedded': embedded }">
    <header v-if="!embedded" class="comment-section__header">
      <div class="page-header">
        <p class="page-eyebrow">{{ t('comment.discussionEyebrow') }}</p>
        <h2>{{ t('comment.discussionTitle') }}</h2>
        <p>{{ t('comment.discussionDescription') }}</p>
      </div>
      <span class="ui-pill ui-pill--status">{{ t('comment.loadedCount', { count: loadedCount }) }}</span>
    </header>

    <CommentEditor
      v-if="authStore.isAuthenticated"
      :submit-text="t('comment.post')"
      :loading-text="t('comment.posting')"
      :loading="isCreating"
      :reset-key="editorResetKey"
      :placeholder="t('comment.editorPlaceholder')"
      :label="t('comment.editorLabel')"
      @submit="createNewComment"
    />

    <p v-else class="notice-card">{{ t('comment.loginToPost') }}</p>

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
      :eyebrow="t('comment.emptyEyebrow')"
      :title="t('comment.emptyTitle')"
      :message="t('comment.emptyMessage')"
    />

    <p v-if="errorMessage" class="error-text">
      {{ errorMessage }}
      <button v-if="hasLoadError" type="button" class="retry-btn secondary btn-sm" @click="retryLoadMoreComments">
        {{ t('common.retry') }}
      </button>
    </p>

    <LoadingState v-if="isLoading" />

    <p v-if="allLoaded && comments.length > 0" class="muted-text comment-section__end">{{ t('comment.end') }}</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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

const props = withDefaults(
  defineProps<{
    articleId: number
    embedded?: boolean
  }>(),
  {
    embedded: false,
  },
)

const authStore = useAuthStore()
const { t } = useI18n()

const comments = ref<CommentNode[]>([])
const page = ref(1)
const pageSize = 10
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const hasLoadError = ref(false)
const sentinelRef = ref<HTMLElement | null>(null)
const isCreating = ref(false)
const updatingId = ref<number | null>(null)
const deletingId = ref<number | null>(null)
const editorResetKey = ref(0)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value && !hasLoadError.value)
const loadedCount = computed(() =>
  comments.value.reduce((count, node) => count + 1 + node.children.length, 0),
)

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

function retryLoadMoreComments(): void {
  clearLoadError()
  void loadMoreComments()
}

function canCurrentUserEdit(comment: CommentModel): boolean {
  return canEditComment(authStore.currentUser, comment)
}

function canCurrentUserDelete(comment: CommentModel): boolean {
  return canDeleteComment(authStore.currentUser, comment)
}

async function loadMoreComments(): Promise<void> {
  if (isLoading.value || allLoaded.value || hasLoadError.value) {
    return
  }

  isLoading.value = true
  clearLoadError()

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
    hasLoadError.value = true
    if (error instanceof AppError) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = t('comment.errors.loadFailed')
    }
  } finally {
    isLoading.value = false
  }
}

async function createNewComment(content: string): Promise<void> {
  if (!authStore.isAuthenticated) {
    errorMessage.value = t('comment.errors.loginBeforePost')
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
      errorMessage.value = t('comment.errors.postFailed')
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
      errorMessage.value = t('comment.errors.updateFailed')
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
      errorMessage.value = t('comment.errors.deleteFailed')
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
  gap: var(--space-20);
}

.comment-section--embedded {
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.comment-section__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: var(--space-16);
}

.comment-section__header .page-header {
  max-width: 44rem;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-16);
}

.retry-btn {
  margin-left: var(--space-10);
}

.comment-section__end {
  text-align: center;
}

.sentinel {
  height: 1px;
}

@media (max-width: 768px) {
  .comment-section__header {
    display: grid;
  }
}
</style>
