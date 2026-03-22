<template>
  <li class="comment-item">
    <div class="head">
      <RouterLink :to="`/user/${comment.userId}`">@{{ displayName }}</RouterLink>
      <span>{{ displayTime }}</span>
    </div>

    <div v-if="isEditing">
      <CommentEditor
        :model-value="editDraft"
        submit-text="Save"
        loading-text="Saving..."
        :loading="isSaving"
        :show-cancel="true"
        @submit="emit('update', { id: comment.id, content: $event })"
        @cancel="cancelEdit"
      />
    </div>

    <div v-else>
      <p v-if="replyLabel" class="reply-label">{{ replyLabel }}</p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="renderedHtml" />
      <div v-if="canEdit || canDelete" class="actions">
        <button v-if="canEdit" type="button" class="ghost" @click="startEdit">Edit</button>
        <button v-if="canDelete" type="button" class="danger" :disabled="isDeleting" @click="emit('delete', comment.id)">
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>

    <ul v-if="children.length > 0" class="child-list">
      <CommentItem
        v-for="child in children"
        :key="child.id"
        :comment="child"
        :children="child.children ?? []"
        :can-edit="resolveCanEdit ? resolveCanEdit(child) : false"
        :can-delete="resolveCanDelete ? resolveCanDelete(child) : false"
        :is-saving="activeSavingId === child.id"
        :is-deleting="activeDeletingId === child.id"
        :resolve-can-edit="resolveCanEdit"
        :resolve-can-delete="resolveCanDelete"
        :active-saving-id="activeSavingId"
        :active-deleting-id="activeDeletingId"
        @update="emit('update', $event)"
        @delete="emit('delete', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import CommentEditor from '@/components/comment/CommentEditor.vue'
import { renderMarkdown } from '@/utils/markdown'
import type { CommentItem as CommentModel } from '@/types/comment'

const props = withDefaults(
  defineProps<{
    comment: CommentModel
    canEdit?: boolean
    canDelete?: boolean
    isSaving?: boolean
    isDeleting?: boolean
    children?: CommentModel[]
    resolveCanEdit?: (comment: CommentModel) => boolean
    resolveCanDelete?: (comment: CommentModel) => boolean
    activeSavingId?: number | null
    activeDeletingId?: number | null
  }>(),
  {
    canEdit: false,
    canDelete: false,
    isSaving: false,
    isDeleting: false,
    children: () => [],
    resolveCanEdit: undefined,
    resolveCanDelete: undefined,
    activeSavingId: null,
    activeDeletingId: null,
  },
)

const emit = defineEmits<{
  update: [payload: { id: number; content: string }]
  delete: [id: number]
}>()

const isEditing = ref(false)
const editDraft = ref(props.comment.content)

const displayName = computed(() => props.comment.userName ?? props.comment.username ?? 'unknown')
const displayTime = computed(() => props.comment.createdTime ?? props.comment.createTime ?? '')
const renderedHtml = computed(() => renderMarkdown(props.comment.content ?? ''))
const replyLabel = computed(() => {
  const replyUserName = props.comment.replyUserName
  const replyToCommentId = props.comment.replyToCommentId

  if (replyUserName && replyToCommentId != null) {
    return `Reply @${replyUserName} · #${replyToCommentId}`
  }

  if (replyUserName) {
    return `Reply @${replyUserName}`
  }

  if (replyToCommentId != null) {
    return `Reply #${replyToCommentId}`
  }

  return ''
})

watch(
  () => props.comment.content,
  (value) => {
    editDraft.value = value
  },
)

watch(
  () => props.isSaving,
  (saving) => {
    if (!saving) {
      isEditing.value = false
    }
  },
)

function startEdit(): void {
  editDraft.value = props.comment.content
  isEditing.value = true
}

function cancelEdit(): void {
  editDraft.value = props.comment.content
  isEditing.value = false
}
</script>

<style scoped>
.comment-item {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  padding: 0.85rem;
  display: grid;
  gap: 0.7rem;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  font-size: 0.9rem;
  color: var(--color-muted);
}

.head a {
  text-decoration: none;
  font-weight: 700;
}

.content {
  line-height: 1.6;
}

.reply-label {
  margin: 0;
  color: var(--color-muted);
  font-size: 0.88rem;
}

.actions {
  display: flex;
  gap: 0.55rem;
}

.child-list {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1rem;
  display: grid;
  gap: 0.7rem;
  border-left: 2px solid var(--color-border);
}

button {
  border: 0;
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

button.ghost {
  background: #edf3fb;
  color: #1f4f92;
}

button.danger {
  background: #ffebe9;
  color: #9a2518;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
