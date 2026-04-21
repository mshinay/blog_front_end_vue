<template>
  <li class="comment-item content-card">
    <div class="comment-item__head">
      <RouterLink class="comment-item__author" :to="`/user/${comment.userId}`">@{{ displayName }}</RouterLink>
      <span class="comment-item__time">{{ displayTime }}</span>
    </div>

    <div v-if="isEditing" class="comment-item__editor">
      <CommentEditor
        :model-value="editDraft"
        :submit-text="t('commentItem.editor.save')"
        :loading-text="t('commentItem.editor.saving')"
        :loading="isSaving"
        :show-cancel="true"
        @submit="emit('update', { id: comment.id, content: $event })"
        @cancel="cancelEdit"
      />
    </div>

    <div v-else class="comment-item__body">
      <p v-if="replyLabel" class="comment-item__reply">{{ replyLabel }}</p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="comment-item__content" v-html="renderedHtml" />
      <div v-if="canEdit || canDelete" class="comment-item__actions">
        <button v-if="canEdit" type="button" class="secondary" @click="startEdit">{{ t('commentItem.actions.edit') }}</button>
        <button
          v-if="canDelete"
          type="button"
          class="danger"
          :disabled="isDeleting"
          @click="emit('delete', comment.id)"
        >
          {{ isDeleting ? t('commentItem.actions.deleting') : t('commentItem.actions.delete') }}
        </button>
      </div>
    </div>

    <ul v-if="children.length > 0" class="comment-item__children">
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
import { useI18n } from 'vue-i18n'

import type { CommentItem as CommentModel } from '@/types/comment'
import { renderMarkdown } from '@/utils/markdown'
import CommentEditor from '@/components/comment/CommentEditor.vue'

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
const { t } = useI18n()

const displayName = computed(() => props.comment.userName ?? props.comment.username ?? t('commentItem.authorFallback'))
const displayTime = computed(() => props.comment.createdTime ?? props.comment.createTime ?? '')
const renderedHtml = computed(() => renderMarkdown(props.comment.content ?? ''))
const replyLabel = computed(() => {
  const replyUserName = props.comment.replyUserName
  const replyToCommentId = props.comment.replyToCommentId

  if (replyUserName && replyToCommentId != null) {
    return t('commentItem.reply.toUserAndId', { name: replyUserName, id: replyToCommentId })
  }

  if (replyUserName) {
    return t('commentItem.reply.toUser', { name: replyUserName })
  }

  if (replyToCommentId != null) {
    return t('commentItem.reply.toId', { id: replyToCommentId })
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
.comment-item,
.comment-item__body,
.comment-item__editor {
  gap: var(--space-12);
}

.comment-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-12);
  padding-bottom: var(--space-10);
  border-bottom: 1px solid var(--color-divider);
}

.comment-item__author {
  text-decoration: none;
  font-weight: 700;
}

.comment-item__time {
  color: var(--color-muted);
  font-size: var(--text-meta);
}

.comment-item__reply {
  color: var(--color-text-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.comment-item__content {
  line-height: var(--line-reading);
  color: var(--color-text);
}

.comment-item__actions {
  display: flex;
  align-items: center;
  gap: var(--space-10);
  padding-top: var(--space-8);
}

.comment-item__children {
  list-style: none;
  margin: 0;
  padding: var(--space-16) 0 0 var(--space-16);
  display: grid;
  gap: var(--space-12);
  border-left: 2px solid color-mix(in srgb, var(--color-border) 78%, white);
}

@media (max-width: 640px) {
  .comment-item__actions {
    display: grid;
  }

  .comment-item__actions > * {
    width: 100%;
  }

  .comment-item__children {
    padding-left: var(--space-12);
  }
}
</style>
