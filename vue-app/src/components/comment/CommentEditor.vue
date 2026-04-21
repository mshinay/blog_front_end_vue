<template>
  <form class="comment-editor content-card" @submit.prevent="handleSubmit">
    <label class="comment-editor__label">{{ label }}</label>
    <textarea
      v-model="draft"
      class="ui-textarea comment-editor__input"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      rows="6"
    />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <div class="comment-editor__actions">
      <button type="submit" :disabled="disabled || loading">
        {{ loading ? loadingText : submitText }}
      </button>
      <button
        v-if="showCancel"
        type="button"
        class="secondary"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    submitText?: string
    loadingText?: string
    placeholder?: string
    label?: string
    disabled?: boolean
    loading?: boolean
    showCancel?: boolean
    resetKey?: number
  }>(),
  {
    modelValue: '',
    submitText: 'Submit',
    loadingText: 'Saving...',
    placeholder: 'Write in Markdown...',
    label: 'Content',
    disabled: false,
    loading: false,
    showCancel: false,
    resetKey: 0,
  },
)

const emit = defineEmits<{
  submit: [value: string]
  cancel: []
}>()

const draft = ref(props.modelValue)
const errorMessage = ref('')

watch(
  () => props.modelValue,
  (value) => {
    draft.value = value
    errorMessage.value = ''
  },
)

watch(
  () => props.resetKey,
  () => {
    draft.value = props.modelValue
    errorMessage.value = ''
  },
)

function handleSubmit(): void {
  const value = draft.value.trim()
  if (!value) {
    errorMessage.value = 'Content cannot be empty.'
    return
  }

  errorMessage.value = ''
  emit('submit', value)
}
</script>

<style scoped>
.comment-editor {
  gap: var(--space-12);
  padding: var(--space-20);
}

.comment-editor__label {
  color: var(--color-text-soft);
  font-size: var(--text-body-sm);
  font-weight: 700;
}

.comment-editor__input {
  min-height: calc(var(--control-height-lg) * 2.2);
}

.comment-editor__actions {
  display: flex;
  align-items: center;
  gap: var(--space-12);
}

@media (max-width: 640px) {
  .comment-editor__actions {
    display: grid;
  }

  .comment-editor__actions > * {
    width: 100%;
  }
}
</style>
