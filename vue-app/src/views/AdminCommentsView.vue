<template>
  <section class="admin-page">
    <header>
      <h1>Admin Comments</h1>
      <p>Admin users can soft-delete comments. Editing stays author-only.</p>
      <form class="search-form" @submit.prevent="submitSearch">
        <input v-model.trim="keywordInput" type="text" placeholder="Search comments" />
        <button type="submit">Search</button>
      </form>
    </header>

    <div v-if="comments.length > 0" class="groups">
      <article v-for="comment in comments" :key="comment.commentId" class="group-card">
        <h3>
          <RouterLink :to="`/article/${comment.articleId}`">{{ comment.articleTitle || 'Untitled article' }}</RouterLink>
        </h3>
        <ul class="comment-list">
          <li class="comment-item">
            <p class="meta">
              @{{ comment.userName || 'unknown' }}
              <span v-if="comment.replyUserName"> reply @{{ comment.replyUserName }}</span>
              · {{ comment.createdTime || '' }}
            </p>
            <p class="meta">
              Article Status: {{ formatArticleStatus(comment.articleStatus) }}
              · Comment Status: {{ formatCommentStatus(comment.status) }}
              · Updated: {{ comment.updatedTime || '' }}
            </p>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="content" v-html="renderMarkdown(comment.content || '')" />
            <button
              type="button"
              class="danger"
              :disabled="deletingId === comment.commentId"
              @click="deleteCommentFromAdmin(comment.commentId)"
            >
              {{ deletingId === comment.commentId ? 'Deleting...' : 'Delete' }}
            </button>
          </li>
        </ul>
      </article>
    </div>

    <EmptyState v-else-if="!isLoading && !errorMessage" message="No admin comments found." />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <LoadingState v-if="isLoading" />
    <p v-if="allLoaded && comments.length > 0" class="end-text">No more comments.</p>
    <div ref="sentinelRef" class="sentinel" aria-hidden="true" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { AppError } from '@/api/client'
import { deleteComment, getAdminCommentList } from '@/api/modules/comment'
import EmptyState from '@/components/common/EmptyState.vue'
import LoadingState from '@/components/common/LoadingState.vue'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import type { AdminCommentItem } from '@/types/comment'
import { renderMarkdown } from '@/utils/markdown'

const route = useRoute()
const router = useRouter()
const pageSize = 10

const keywordInput = ref('')
const activeKeyword = ref('')
const comments = ref<AdminCommentItem[]>([])
const page = ref(1)
const isLoading = ref(false)
const allLoaded = ref(false)
const errorMessage = ref('')
const deletingId = ref<number | null>(null)
const sentinelRef = ref<HTMLElement | null>(null)

const observerEnabled = computed(() => !isLoading.value && !allLoaded.value)

function formatArticleStatus(status: AdminCommentItem['articleStatus']): string {
  if (status === 0) {
    return 'Draft'
  }

  if (status === 1) {
    return 'Published'
  }

  return 'Deleted'
}

function formatCommentStatus(status: AdminCommentItem['status']): string {
  if (status === 0) {
    return 'Hidden'
  }

  if (status === 1) {
    return 'Normal'
  }

  return 'Deleted'
}

function resetState(): void {
  comments.value = []
  page.value = 1
  allLoaded.value = false
  errorMessage.value = ''
}

function buildAdminCommentQuery(currentPage: number) {
  return {
    page: currentPage,
    pageSize,
    ...(activeKeyword.value ? { keyword: activeKeyword.value } : {}),
  }
}

async function loadMore(): Promise<void> {
  if (isLoading.value || allLoaded.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await getAdminCommentList(buildAdminCommentQuery(page.value))

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
      errorMessage.value = 'Failed to load admin comments.'
    }
  } finally {
    isLoading.value = false
  }
}

async function refreshList(): Promise<void> {
  const pagesToReload = Math.max(page.value - 1, 1)
  resetState()

  for (let currentPage = 1; currentPage <= pagesToReload; currentPage += 1) {
    await loadMore()

    if (allLoaded.value) {
      break
    }
  }
}

async function submitSearch(): Promise<void> {
  await router.push({
    name: 'admin-comments',
    query: keywordInput.value ? { q: keywordInput.value } : {},
  })
}

async function syncKeyword(): Promise<void> {
  const routeKeyword = typeof route.query.q === 'string' ? route.query.q.trim() : ''
  keywordInput.value = routeKeyword
  activeKeyword.value = routeKeyword
  resetState()
  await loadMore()
}

async function deleteCommentFromAdmin(commentId: number): Promise<void> {
  if (!confirm('Delete this comment?')) {
    return
  }

  deletingId.value = commentId
  errorMessage.value = ''

  try {
    await deleteComment(commentId)
    await refreshList()
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
  () => route.query.q,
  () => {
    void syncKeyword()
  },
  { immediate: true },
)

useInfiniteScroll(sentinelRef, loadMore, {
  enabled: observerEnabled,
})
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.45rem 0 0;
  color: var(--color-muted);
}

.search-form {
  margin-top: 0.75rem;
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
  padding: 0.55rem 1rem;
  cursor: pointer;
}

.groups {
  display: grid;
  gap: 0.8rem;
}

.group-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  padding: 0.85rem;
  display: grid;
  gap: 0.6rem;
}

h3 {
  margin: 0;
}

h3 a {
  text-decoration: none;
}

.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.55rem;
}

.comment-item {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fbfcff;
  padding: 0.7rem;
  display: grid;
  gap: 0.4rem;
}

.meta {
  margin: 0;
  font-size: 0.88rem;
  color: var(--color-muted);
}

.content {
  line-height: 1.6;
}

.danger {
  justify-self: start;
  border: 0;
  border-radius: 8px;
  background: #ffebe9;
  color: #9a2518;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
  border: 1px solid #f6d0ce;
  border-radius: 12px;
  background: #fff2f2;
  padding: 0.75rem;
}

.end-text {
  margin: 0;
  text-align: center;
  color: var(--color-muted);
}

.sentinel {
  height: 1px;
}
</style>
