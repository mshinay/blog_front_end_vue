<template>
  <li class="comment-item">
    <div class="head">
      <RouterLink :to="`/user/${comment.userId}`">@{{ displayName }}</RouterLink>
      <span>{{ comment.createTime ?? '' }}</span>
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
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="content" v-html="renderedHtml" />
      <div v-if="canEdit || canDelete" class="actions">
        <button v-if="canEdit" type="button" class="ghost" @click="startEdit">Edit</button>
        <button v-if="canDelete" type="button" class="danger" :disabled="isDeleting" @click="emit('delete', comment.id)">
          {{ isDeleting ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
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
  }>(),
  {
    canEdit: false,
    canDelete: false,
    isSaving: false,
    isDeleting: false,
  },
)

const emit = defineEmits<{
  update: [payload: { id: number; content: string }]
  delete: [id: number]
}>()

const isEditing = ref(false)
const editDraft = ref(props.comment.content)

const displayName = computed(() => props.comment.userName ?? props.comment.username ?? 'unknown')
const renderedHtml = computed(() => renderMarkdown(props.comment.content ?? ''))

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

.actions {
  display: flex;
  gap: 0.55rem;
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
