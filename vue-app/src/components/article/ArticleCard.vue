<template>
  <article class="article-card">
    <RouterLink :to="`/article/${article.id}`" class="article-link">
      <h3>{{ article.title }}</h3>
      <p>{{ summaryText }}</p>
      <div class="meta">
        <span>{{ article.authorName ?? 'Unknown author' }}</span>
        <span>{{ article.createTime ?? '' }}</span>
      </div>
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { markdownToPlainText } from '@/utils/markdown'
import type { Article } from '@/types/article'

const props = defineProps<{
  article: Article
}>()

const summaryText = computed(() => {
  if (props.article.summary) {
    return props.article.summary
  }

  if (!props.article.content) {
    return 'No summary available.'
  }

  const plain = markdownToPlainText(props.article.content)
  if (plain.length <= 140) {
    return plain
  }

  return `${plain.slice(0, 140)}...`
})
</script>

<style scoped>
.article-card {
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
  transition: transform 180ms ease;
}

.article-card:hover {
  transform: translateY(-2px);
}

.article-link {
  display: block;
  padding: 1rem;
  text-decoration: none;
}

h3 {
  margin: 0;
  font-family: var(--font-display);
}

p {
  margin: 0.75rem 0;
  color: var(--color-muted);
  line-height: 1.5;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .meta {
    gap: 0.4rem;
    flex-direction: column;
  }
}
</style>
