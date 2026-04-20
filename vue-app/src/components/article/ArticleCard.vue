<template>
  <article class="article-card content-card" :class="`article-card--${variant}`">
    <RouterLink :to="`/article/${article.id}`" class="article-card__link">
      <div class="article-card__media" :class="{ 'is-placeholder': !article.coverUrl }">
        <img
          v-if="article.coverUrl"
          class="article-card__cover"
          :src="article.coverUrl"
          :alt="article.title"
        />
        <div v-else class="article-card__placeholder">
          <span class="page-eyebrow article-card__placeholder-label">
            {{ article.categoryName || 'Editorial Pick' }}
          </span>
          <strong>{{ placeholderMonogram }}</strong>
        </div>

        <span v-if="article.categoryName" class="article-card__category ui-pill ui-pill--category">
          {{ article.categoryName }}
        </span>
      </div>

      <div class="article-card__content">
        <div class="article-card__eyebrow-row">
          <span v-if="article.isTop" class="ui-pill ui-pill--status">Top Pick</span>
          <span class="page-eyebrow article-card__eyebrow">
            {{ variant === 'featured' ? 'Featured Story' : 'Fresh Read' }}
          </span>
        </div>

        <div class="article-card__copy">
          <h3 class="article-card__title">{{ article.title }}</h3>
          <p v-if="showSummary" class="article-card__summary">{{ summaryText }}</p>
        </div>

        <div v-if="visibleTags.length > 0" class="article-card__tags">
          <span v-for="tag in visibleTags" :key="tag.id" class="ui-pill ui-pill--topic">
            {{ tag.name }}
          </span>
        </div>

        <div v-if="statItems.length > 0" class="article-card__stats">
          <span v-for="item in statItems" :key="item.label" class="article-card__stat">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </span>
        </div>

        <div class="article-card__meta">
          <span>{{ authorText }}</span>
          <span>{{ publishedText }}</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { ArticleCardModel } from '@/types/article'

const props = withDefaults(
  defineProps<{
    article: ArticleCardModel
    variant?: 'default' | 'featured' | 'compact'
  }>(),
  {
    variant: 'default',
  },
)

const summaryText = computed(() => {
  const summary = props.article.summary?.trim()

  if (!summary) {
    return ''
  }

  if (props.variant === 'compact' && summary.length > 110) {
    return `${summary.slice(0, 107)}...`
  }

  return summary
})

const resolvedTagList = computed(() => props.article.tagList ?? [])

const visibleTags = computed(() => {
  const maxCount = props.variant === 'featured' ? 4 : props.variant === 'compact' ? 2 : 3
  return resolvedTagList.value.slice(0, maxCount)
})

const showSummary = computed(() => Boolean(summaryText.value))

const authorText = computed(() => `By ${props.article.authorName || 'Unknown author'}`)

const publishedText = computed(() => formatDate(props.article.publishTime || props.article.createTime))

const placeholderMonogram = computed(() => {
  const source = props.article.title.trim()
  return source.slice(0, 2).toUpperCase()
})

const statItems = computed(() => {
  const items: Array<{ label: string; value: string }> = []

  if (typeof props.article.viewCount === 'number') {
    items.push({ label: 'Views', value: compactNumber(props.article.viewCount) })
  }

  if (typeof props.article.commentCount === 'number') {
    items.push({ label: 'Comments', value: compactNumber(props.article.commentCount) })
  }

  return props.variant === 'compact' ? items.slice(0, 1) : items.slice(0, 2)
})

function formatDate(value?: string): string {
  if (!value) {
    return 'Draft date unavailable'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function compactNumber(value: number): string {
  return new Intl.NumberFormat('en', {
    notation: value >= 1000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value)
}
</script>

<style scoped>
.article-card {
  padding: 0;
  transition:
    transform var(--motion-fast) var(--ease-standard),
    box-shadow var(--motion-base) var(--ease-standard),
    border-color var(--motion-base) var(--ease-standard);
}

.article-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
  border-color: var(--color-border-strong);
}

.article-card__link {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  gap: var(--space-20);
  height: 100%;
  padding: var(--space-24);
  color: inherit;
  text-decoration: none;
}

.article-card__media {
  position: relative;
  overflow: hidden;
  border-radius: calc(var(--radius-lg) - 4px);
  background: linear-gradient(180deg, rgba(246, 241, 232, 0.94) 0%, rgba(239, 231, 218, 0.98) 100%);
  aspect-ratio: 4 / 3;
}

.article-card__media.is-placeholder {
  border: 1px solid var(--color-border);
}

.article-card__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-card__placeholder {
  display: grid;
  align-content: end;
  gap: var(--space-8);
  width: 100%;
  height: 100%;
  padding: var(--space-16);
  background:
    linear-gradient(180deg, rgba(31, 42, 51, 0.04) 0%, rgba(166, 90, 58, 0.18) 100%),
    linear-gradient(135deg, rgba(251, 248, 242, 0.92) 0%, rgba(239, 231, 218, 0.98) 100%);
}

.article-card__placeholder-label {
  color: var(--color-accent-strong);
}

.article-card__placeholder strong {
  font-family: var(--font-display);
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 0.9;
  letter-spacing: var(--tracking-tight);
  color: var(--color-text);
}

.article-card__category {
  position: absolute;
  top: var(--space-12);
  left: var(--space-12);
}

.article-card__content {
  display: grid;
  align-content: start;
  gap: var(--space-16);
  min-width: 0;
}

.article-card__eyebrow-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.article-card__eyebrow {
  color: var(--color-muted);
}

.article-card__copy {
  display: grid;
  gap: var(--space-10);
}

.article-card__title {
  font-size: var(--text-card-title);
  line-height: var(--line-heading);
}

.article-card__summary {
  color: var(--color-muted);
  font-size: var(--text-body-sm);
  line-height: var(--line-body);
}

.article-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8);
}

.article-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-10);
}

.article-card__stat {
  display: inline-grid;
  gap: var(--space-2);
  min-width: 4.5rem;
  padding: var(--space-8) var(--space-10);
  border: 1px solid var(--color-divider);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.article-card__stat strong {
  font-size: 1rem;
  line-height: 1;
  color: var(--color-text);
}

.article-card__stat span {
  color: var(--color-muted);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
}

.article-card__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: var(--space-8) var(--space-12);
  padding-top: var(--space-12);
  border-top: 1px solid var(--color-divider);
  color: var(--color-muted);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
}

.article-card--featured {
  box-shadow: var(--shadow-medium);
}

.article-card--featured .article-card__link {
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: var(--space-24);
}

.article-card--featured .article-card__media {
  aspect-ratio: 16 / 11;
}

.article-card--featured .article-card__title {
  font-size: clamp(1.55rem, 2.4vw, 2.1rem);
  line-height: var(--line-tight);
}

.article-card--featured .article-card__summary {
  font-size: var(--text-body-lg);
}

.article-card--compact .article-card__link {
  grid-template-columns: minmax(0, 112px) minmax(0, 1fr);
  gap: var(--space-16);
  padding: var(--space-20);
}

.article-card--compact .article-card__media {
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md);
}

.article-card--compact .article-card__content {
  gap: var(--space-12);
}

.article-card--compact .article-card__title {
  font-size: 1.08rem;
}

.article-card--compact .article-card__summary {
  font-size: var(--text-meta);
}

.article-card--compact .article-card__meta {
  justify-content: flex-start;
}

@media (max-width: 900px) {
  .article-card__link,
  .article-card--featured .article-card__link {
    grid-template-columns: 1fr;
  }

  .article-card--compact .article-card__link {
    grid-template-columns: minmax(0, 132px) minmax(0, 1fr);
  }

  .article-card__media,
  .article-card--featured .article-card__media {
    aspect-ratio: 16 / 10;
  }
}

@media (max-width: 640px) {
  .article-card__link,
  .article-card--compact .article-card__link {
    grid-template-columns: 1fr;
  }

  .article-card__media,
  .article-card--compact .article-card__media {
    aspect-ratio: 16 / 11;
  }

  .article-card__meta {
    flex-direction: column;
  }
}
</style>
