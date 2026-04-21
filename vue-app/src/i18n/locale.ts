export const SUPPORTED_LOCALES = ['en', 'zh-CN'] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'blog-locale'

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  )
}

export function getPersistedLocale(): SupportedLocale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(raw) ? raw : null
  } catch {
    return null
  }
}

export function persistLocale(locale: SupportedLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    // best-effort persistence; locale switching should still work
  }
}

export function deriveLocaleFromBrowser(): SupportedLocale {
  // Spec: if browser language starts with zh => zh-CN, else en
  const lang =
    typeof navigator !== 'undefined'
      ? (navigator.languages?.[0] ?? navigator.language)
      : undefined

  if (typeof lang === 'string' && lang.toLowerCase().startsWith('zh')) {
    return 'zh-CN'
  }
  return 'en'
}

export function getInitialLocale(): SupportedLocale {
  return getPersistedLocale() ?? deriveLocaleFromBrowser() ?? 'en'
}

