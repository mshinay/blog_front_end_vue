<template>
  <form class="editor-shell" @submit.prevent="handleSubmit">
    <div class="field-block">
      <label for="article-title">Title</label>
      <input
        id="article-title"
        v-model.trim="title"
        type="text"
        placeholder="Enter article title"
        :disabled="submitting || loading"
      />
    </div>

    <div class="field-block">
      <label>Content</label>
      <ByteMdEditor
        :value="content"
        :plugins="plugins"
        mode="split"
        :read-only="submitting || loading"
        @change="handleContentChange"
      />
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <div class="actions">
      <button type="submit" :disabled="submitting || loading">
        {{ submitting ? submittingText : submitText }}
      </button>
      <button
        v-if="showCancel"
        type="button"
        class="ghost"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'

const ByteMdEditor = defineAsyncComponent(async () => {
  const module = (await import('@bytemd/vue-next')) as unknown as {
    Editor: never
  }
  return module.Editor
})

const props = withDefaults(
  defineProps<{
    initialTitle?: string
    initialContent?: string
    submitText?: string
    submittingText?: string
    loading?: boolean
    submitting?: boolean
    showCancel?: boolean
  }>(),
  {
    initialTitle: '',
    initialContent: '',
    submitText: 'Save Article',
    submittingText: 'Saving...',
    loading: false,
    submitting: false,
    showCancel: false,
  },
)

const emit = defineEmits<{
  submit: [payload: { title: string; content: string }]
  cancel: []
}>()

const title = ref(props.initialTitle)
const content = ref(props.initialContent)
const errorMessage = ref('')
const plugins = [gfm(), highlight()]

watch(
  () => props.initialTitle,
  (value) => {
    title.value = value
  },
)

watch(
  () => props.initialContent,
  (value) => {
    content.value = value
  },
)

function handleContentChange(nextValue: string) {
  content.value = nextValue
}

function handleSubmit(): void {
  if (!title.value.trim()) {
    errorMessage.value = 'Title cannot be empty.'
    return
  }

  if (!content.value.trim()) {
    errorMessage.value = 'Content cannot be empty.'
    return
  }

  errorMessage.value = ''
  emit('submit', {
    title: title.value.trim(),
    content: content.value.trim(),
  })
}
</script>

<style scoped>
.editor-shell {
  display: grid;
  gap: 0.9rem;
}

.field-block {
  display: grid;
  gap: 0.45rem;
}

label {
  font-weight: 700;
}

input {
  border: 1px solid var(--color-border-strong);
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
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
  padding: 0.55rem 0.9rem;
  cursor: pointer;
}

button.ghost {
  background: transparent;
  border: 1px solid var(--color-border-strong);
  color: var(--color-text);
}

button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.error-text {
  margin: 0;
  color: #b42318;
}
</style>
