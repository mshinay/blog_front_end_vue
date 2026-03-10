<template>
  <section class="person-page">
    <header>
      <h1>Personal Center</h1>
      <p>Manage your profile and your own content.</p>
    </header>

    <nav class="tabs" aria-label="Personal center sections">
      <button
        v-for="tab in tabs"
        :key="tab"
        type="button"
        class="tab-btn"
        :class="{ active: activeTab === tab }"
        @click="switchTab(tab)"
      >
        {{ tabLabelMap[tab] }}
      </button>
    </nav>

    <AccountSettingsPanel v-if="activeTab === 'account'" />
    <MyArticlesPanel v-else-if="activeTab === 'articles'" />
    <MyCommentsPanel v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AccountSettingsPanel from '@/components/person/AccountSettingsPanel.vue'
import MyArticlesPanel from '@/components/person/MyArticlesPanel.vue'
import MyCommentsPanel from '@/components/person/MyCommentsPanel.vue'
import { PERSON_TABS, resolvePersonTab, type PersonTab } from '@/utils/person-tabs'

const route = useRoute()
const router = useRouter()

const tabs = PERSON_TABS
const tabLabelMap: Record<PersonTab, string> = {
  account: 'Account Settings',
  articles: 'My Blogs',
  comments: 'My Comments',
}

const activeTab = ref<PersonTab>('account')

async function switchTab(tab: PersonTab): Promise<void> {
  if (activeTab.value === tab) {
    return
  }

  await router.replace({
    name: 'person-center',
    query: { ...route.query, tab },
  })
}

watch(
  () => route.query.tab,
  (tabQuery) => {
    const nextTab = resolvePersonTab(tabQuery)
    activeTab.value = nextTab

    if (tabQuery !== nextTab) {
      void router.replace({
        name: 'person-center',
        query: { ...route.query, tab: nextTab },
      })
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.person-page {
  display: grid;
  gap: 1rem;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
}

header p {
  margin: 0.4rem 0 0;
  color: var(--color-muted);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.tab-btn {
  border: 1px solid var(--color-border-strong);
  border-radius: 999px;
  background: #fff;
  color: var(--color-text);
  padding: 0.38rem 0.85rem;
  cursor: pointer;
}

.tab-btn.active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-surface);
}
</style>
