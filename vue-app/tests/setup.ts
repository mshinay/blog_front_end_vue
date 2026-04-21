import { beforeEach } from 'vitest'
import { config } from '@vue/test-utils'

import { i18n, setLocale } from '@/i18n'

// Ensure any component calling `useI18n()` can mount in unit tests without
// per-test boilerplate.
config.global.plugins = [...(config.global.plugins ?? []), i18n]

beforeEach(() => {
  localStorage.clear()
  // Keep tests deterministic and avoid leaking locale changes across suites.
  setLocale('en', { persist: false })
})
