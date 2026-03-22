<template>
  <article class="article-card">
    <RouterLink :to="`/article/${article.id}`" class="article-link">
      <img
        v-if="article.coverUrl"
        class="cover"
        :src="article.coverUrl"
        :alt="article.title"
      />
      <div class="content">
        <h3>{{ article.title }}</h3>
        <p>{{ summaryText }}</p>
        <div v-if="resolvedTagList.length > 0" class="tags">
          <span v-for="tag in resolvedTagList" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>
        <div class="meta">
          <span>{{ article.authorName || 'Unknown author' }}</span>
          <span>{{ article.publishTime || article.createTime || '' }}</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ArticleCardModel } from '@/types/article'

const props = defineProps<{
  article: ArticleCardModel
}>()

const summaryText = computed(() => props.article.summary || 'No summary available.')
const resolvedTagList = computed(() => props.article.tagList ?? [])
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
  display: grid;
  grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding: 1rem;
  text-decoration: none;
}

.cover {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 12px;
  background: #eef2f6;
}

.content {
  min-width: 0;
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

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.8rem;
}

.tag {
  border-radius: 999px;
  background: #edf3fb;
  color: #1f4f92;
  font-size: 0.75rem;
  padding: 0.18rem 0.55rem;
}

.meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-muted);
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .article-link {
    grid-template-columns: 1fr;
  }

  .meta {
    gap: 0.4rem;
    flex-direction: column;
  }
}
</style>
