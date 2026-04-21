<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-header__frame">
        <div class="app-header__bar">
          <RouterLink class="brand" to="/main" @click="closeMenu">
            <span class="brand__mark" aria-hidden="true">BF</span>
            <span class="brand__copy">
              <span class="page-eyebrow brand__eyebrow">Editorial Tech</span>
              <span class="brand__title">Blog Front End</span>
            </span>
          </RouterLink>

          <button
            class="app-header__menu-toggle secondary btn-sm"
            type="button"
            :aria-expanded="isMenuOpen"
            aria-controls="global-nav-panel"
            @click="toggleMenu"
          >
            <span class="app-header__menu-label">{{ t('header.menu') }}</span>
            <span class="app-header__menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        <div id="global-nav-panel" class="app-header__panel" :class="{ 'is-open': isMenuOpen }">
          <nav class="primary-nav" :aria-label="t('header.primaryNavAria')">
            <RouterLink
              v-for="item in primaryNavItems"
              :key="item.to"
              class="primary-nav__link"
              :to="item.to"
              @click="closeMenu"
            >
              <span class="primary-nav__label">{{ item.label }}</span>
              <span class="primary-nav__hint">{{ item.hint }}</span>
            </RouterLink>
          </nav>

          <div v-if="authStore.isAdmin" class="admin-nav">
            <span class="admin-nav__label">{{ t('nav.admin') }}</span>
            <div class="admin-nav__links">
              <RouterLink
                v-for="item in adminNavItems"
                :key="item.to"
                class="admin-nav__link"
                :to="item.to"
                @click="closeMenu"
              >
                {{ item.label }}
              </RouterLink>
            </div>
          </div>

          <div class="auth-actions">
            <div v-if="authStore.isAuthenticated" class="auth-actions__identity">
              <span class="auth-actions__eyebrow">{{ t('header.signedIn') }}</span>
              <span class="auth-actions__name">{{ authStore.currentUser?.username }}</span>
            </div>

            <div class="auth-actions__buttons">
              <label class="locale-switch">
                <span class="locale-switch__label">{{ t('header.languageAria') }}</span>
                <select
                  class="locale-switch__select"
                  :value="locale"
                  :aria-label="t('header.languageAria')"
                  @change="handleLocaleChange"
                >
                  <option value="en">{{ t('locale.english') }}</option>
                  <option value="zh-CN">{{ t('locale.zhCN') }}</option>
                </select>
              </label>
              <RouterLink
                v-if="!authStore.isAuthenticated"
                class="btn ghost btn-sm"
                to="/login"
                @click="closeMenu"
              >
                {{ t('auth.login') }}
              </RouterLink>
              <RouterLink
                v-if="!authStore.isAuthenticated"
                class="btn btn-sm"
                to="/register"
                @click="closeMenu"
              >
                {{ t('auth.register') }}
              </RouterLink>
              <button v-else class="btn secondary btn-sm" type="button" @click="handleLogout">
                {{ t('auth.logout') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { useLocale } from '@/i18n'
import { isSupportedLocale } from '@/i18n/locale'
import { useAuthStore } from '@/stores/auth'

type NavItem = {
  label: string
  hint: string
  to: string
}

const { t } = useI18n()
const { locale, setLocale } = useLocale()

const primaryNavItems = computed<NavItem[]>(() => [
  { label: t('nav.home'), hint: t('navHints.home'), to: '/main' },
  { label: t('nav.search'), hint: t('navHints.search'), to: '/search' },
  { label: t('nav.write'), hint: t('navHints.write'), to: '/upload' },
  { label: t('nav.profile'), hint: t('navHints.profile'), to: '/person' },
])

const adminNavItems = computed<NavItem[]>(() => [
  { label: t('nav.articles'), hint: t('navHints.articles'), to: '/admin/articles' },
  { label: t('nav.comments'), hint: t('navHints.comments'), to: '/admin/comments' },
])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isMenuOpen = ref(false)

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  },
)

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu(): void {
  isMenuOpen.value = false
}

function handleLocaleChange(event: Event): void {
  const nextLocale = (event.target as HTMLSelectElement | null)?.value
  if (isSupportedLocale(nextLocale)) setLocale(nextLocale)
}

function handleLogout(): void {
  closeMenu()
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  padding: var(--space-12) var(--layout-shell-padding) 0;
}

.app-header__inner {
  width: min(100%, var(--layout-page-max));
  margin: 0 auto;
}

.app-header__frame {
  position: relative;
  border: 1px solid color-mix(in srgb, var(--color-border-strong) 72%, white);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, rgba(251, 248, 242, 0.95) 0%, rgba(246, 241, 232, 0.9) 100%);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(16px);
}

.app-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-16);
  padding: var(--space-12) var(--space-16);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-12);
  min-width: 0;
  color: var(--color-text);
  text-decoration: none;
}

.brand:hover {
  color: var(--color-text);
}

.brand__mark {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  border: 1px solid color-mix(in srgb, var(--color-border-strong) 75%, white);
  border-radius: var(--radius-md);
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--color-accent-soft) 82%, white) 0%, var(--color-surface) 100%);
  color: var(--color-accent-strong);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.brand__copy {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
}

.brand__eyebrow {
  color: var(--color-muted);
}

.brand__title {
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 1.8vw, 1.45rem);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  line-height: var(--line-tight);
}

.app-header__menu-toggle {
  display: none;
  flex: 0 0 auto;
}

.app-header__menu-label {
  font-size: var(--text-meta);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.app-header__menu-icon {
  display: inline-grid;
  gap: 4px;
}

.app-header__menu-icon span {
  width: 16px;
  height: 1.5px;
  border-radius: var(--radius-pill);
  background: currentColor;
}

.app-header__panel {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) auto auto;
  align-items: center;
  gap: var(--space-16);
  padding: 0 var(--space-16) var(--space-12);
  border-top: 1px solid var(--color-divider);
}

.primary-nav {
  display: flex;
  align-items: stretch;
  gap: var(--space-8);
  min-width: 0;
}

.primary-nav__link {
  display: grid;
  gap: var(--space-4);
  min-width: 0;
  padding: var(--space-10) var(--space-12);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-soft);
  text-decoration: none;
  transition:
    border-color var(--motion-base) var(--ease-standard),
    background-color var(--motion-base) var(--ease-standard),
    color var(--motion-base) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.primary-nav__link:hover {
  transform: translateY(-1px);
  border-color: var(--color-border);
  background: color-mix(in srgb, var(--color-surface) 90%, white);
  color: var(--color-text);
}

.primary-nav__link.router-link-active {
  border-color: color-mix(in srgb, var(--color-border-strong) 78%, white);
  background: linear-gradient(180deg, rgba(251, 248, 242, 0.92) 0%, rgba(234, 216, 203, 0.72) 100%);
  color: var(--color-text);
  box-shadow: inset 0 -2px 0 var(--color-accent);
}

.primary-nav__label {
  font-size: var(--text-body-sm);
  font-weight: 700;
  line-height: 1.2;
}

.primary-nav__hint {
  color: var(--color-muted);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
  white-space: nowrap;
}

.admin-nav {
  display: grid;
  gap: var(--space-8);
  justify-items: end;
}

.admin-nav__label {
  color: var(--color-muted-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  letter-spacing: var(--tracking-wide);
  line-height: var(--line-meta);
  text-transform: uppercase;
}

.admin-nav__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-8);
}

.admin-nav__link {
  display: inline-flex;
  align-items: center;
  min-height: var(--control-height-sm);
  padding: var(--space-8) var(--space-12);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-surface) 84%, white);
  color: var(--color-muted);
  font-size: var(--text-meta);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
}

.admin-nav__link:hover,
.admin-nav__link.router-link-active {
  border-color: var(--color-border-strong);
  background: var(--color-surface-soft);
  color: var(--color-text-soft);
}

.auth-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-12);
}

.auth-actions__identity {
  display: grid;
  gap: var(--space-2);
  min-width: 0;
  text-align: right;
}

.auth-actions__eyebrow {
  color: var(--color-muted-soft);
  font-size: var(--text-meta);
  line-height: var(--line-meta);
}

.auth-actions__name {
  color: var(--color-text);
  font-size: var(--text-body-sm);
  font-weight: 700;
  line-height: 1.25;
}

.auth-actions__buttons {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.locale-switch {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
}

.locale-switch__label {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.locale-switch__select {
  min-height: var(--control-height-sm);
  padding: 0 var(--space-10);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--color-surface) 84%, white);
  color: var(--color-text-soft);
  font-size: var(--text-meta);
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
}

.locale-switch__select:hover,
.locale-switch__select:focus-visible {
  border-color: var(--color-border-strong);
  outline: none;
}

@media (max-width: 1120px) {
  .app-header__panel {
    grid-template-columns: minmax(0, 1fr);
    justify-items: stretch;
  }

  .admin-nav,
  .auth-actions,
  .auth-actions__identity {
    justify-items: start;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: var(--space-10) var(--layout-shell-padding-mobile) 0;
  }

  .app-header__bar {
    padding: var(--space-12);
  }

  .app-header__menu-toggle {
    display: inline-flex;
  }

  .app-header__panel {
    position: absolute;
    top: calc(100% + var(--space-8));
    left: 0;
    right: 0;
    z-index: 10;
    grid-template-columns: 1fr;
    gap: var(--space-16);
    padding: var(--space-16);
    border: 1px solid color-mix(in srgb, var(--color-border-strong) 72%, white);
    border-radius: var(--radius-xl);
    background:
      linear-gradient(180deg, rgba(251, 248, 242, 0.98) 0%, rgba(246, 241, 232, 0.98) 100%);
    box-shadow: var(--shadow-medium);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.5rem);
    pointer-events: none;
    transition:
      opacity var(--motion-base) var(--ease-standard),
      transform var(--motion-base) var(--ease-standard),
      visibility var(--motion-base) var(--ease-standard);
  }

  .app-header__panel.is-open {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    pointer-events: auto;
  }

  .primary-nav {
    display: grid;
    gap: var(--space-10);
  }

  .primary-nav__link,
  .primary-nav__hint,
  .admin-nav,
  .admin-nav__links,
  .auth-actions,
  .auth-actions__buttons {
    width: 100%;
  }

  .primary-nav__hint {
    white-space: normal;
  }

  .admin-nav {
    justify-items: start;
  }

  .admin-nav__links,
  .auth-actions__buttons {
    display: grid;
    gap: var(--space-8);
  }

  .auth-actions {
    align-items: stretch;
  }

  .auth-actions__buttons > * {
    width: 100%;
  }
}
</style>
