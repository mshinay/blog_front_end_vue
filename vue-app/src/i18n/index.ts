import { computed, type ComputedRef, type Ref } from 'vue'
import { createI18n } from 'vue-i18n'

import en from '@/i18n/messages/en'
import zhCN from '@/i18n/messages/zh-CN'
import {
  getInitialLocale,
  persistLocale,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/i18n/locale'

type DeepStringify<T> = T extends string
  ? string
  : { [K in keyof T]: DeepStringify<T[K]> }

type MessageSchema = DeepStringify<typeof en>

const messages: Record<SupportedLocale, MessageSchema> = {
  en,
  'zh-CN': zhCN,
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages,
})

function localeRef(): Ref<SupportedLocale> {
  return i18n.global.locale as unknown as Ref<SupportedLocale>
}

export function setLocale(
  locale: SupportedLocale,
  opts: { persist?: boolean } = {},
): void {
  localeRef().value = locale
  if (opts.persist !== false) persistLocale(locale)
}

export function useLocale(): {
  locale: ComputedRef<SupportedLocale>
  supportedLocales: readonly SupportedLocale[]
  setLocale: typeof setLocale
} {
  // Computed keeps consumers reactive without exposing the raw Ref internals.
  const locale = computed(() => localeRef().value)

  return {
    locale,
    supportedLocales: SUPPORTED_LOCALES,
    setLocale,
  }
}

export type { SupportedLocale }
export { SUPPORTED_LOCALES }
