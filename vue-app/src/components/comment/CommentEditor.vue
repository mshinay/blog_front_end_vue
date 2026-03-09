<template>
  <form class="editor" @submit.prevent="handleSubmit">
    <label>{{ label }}</label>
    <textarea
      v-model="draft"
      :placeholder="placeholder"
      :disabled="disabled || loading"
      rows="6"
    />
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    <div class="actions">
      <button type="submit" :disabled="disabled || loading">
        {{ loading ? loadingText : submitText }}
      </button>
      <button v-if="showCancel" type="button" class="ghost" :disabled="loading" @click="emit('cancel')">
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

function handleSubmit(): void {
  const value = draft.value.trim()
  if (!value) {
    errorMessage.value = 'Content cannot be empty.'
    return
  }

  errorMessage.value = ''
  emit('submit', value)

  if (!props.showCancel) {
    draft.value = ''
  }
}
</script>

<style scoped>
.editor {
  display: grid;
  gap: 0.6rem;
}

label {
  font-weight: 700;
  color: var(--color-text);
}

textarea {
  width: 100%;
  resize: vertical;
  border: 1px solid var(--color-border-strong);
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  font: inherit;
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
  padding: 0.5rem 0.9rem;
  cursor: pointer;
}

button.ghost {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
}
</style>
