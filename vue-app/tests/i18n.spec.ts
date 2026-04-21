import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import { i18n, setLocale } from '@/i18n'
import {
  deriveLocaleFromBrowser,
  getInitialLocale,
  LOCALE_STORAGE_KEY,
} from '@/i18n/locale'
import ArticleCard from '@/components/article/ArticleCard.vue'

function setNavigatorLanguage(lang: string, languages?: string[]): void {
  Object.defineProperty(window.navigator, 'language', {
    value: lang,
    configurable: true,
  })

  if (languages) {
    Object.defineProperty(window.navigator, 'languages', {
      value: languages,
      configurable: true,
    })
  }
}

describe('i18n bootstrap + switching', () => {
  beforeEach(() => {
    localStorage.clear()
    setLocale('en', { persist: false })
  })

  it('selects persisted locale deterministically on boot', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'zh-CN')
    setNavigatorLanguage('en-US', ['en-US'])

    expect(getInitialLocale()).toBe('zh-CN')
  })

  it('falls back to browser language when persisted locale is missing or invalid', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'fr')
    setNavigatorLanguage('zh-TW', ['zh-TW'])

    expect(getInitialLocale()).toBe('zh-CN')
  })

  it('derives zh-CN when browser language starts with zh; otherwise en', () => {
    setNavigatorLanguage('zh-HK', ['zh-HK'])
    expect(deriveLocaleFromBrowser()).toBe('zh-CN')

    setNavigatorLanguage('en-GB', ['en-GB'])
    expect(deriveLocaleFromBrowser()).toBe('en')
  })

  it('persists explicit locale switch by default and supports non-persisted switches', () => {
    setLocale('zh-CN')
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('zh-CN')

    localStorage.setItem(LOCALE_STORAGE_KEY, 'en')
    setLocale('zh-CN', { persist: false })
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en')
  })

  it('updates translated UI immediately without reload when switching locale', async () => {
    const Demo = {
      template: '<button data-testid="btn">{{ t("common.retry") }}</button>',
      setup() {
        const { t } = useI18n()
        return { t }
      },
    }

    const wrapper = mount(Demo)
    expect(wrapper.get('[data-testid="btn"]').text()).toBe('Retry')

    setLocale('zh-CN', { persist: false })
    await nextTick()
    expect(wrapper.get('[data-testid="btn"]').text()).toBe('重试')
  })

  it('does not translate backend-authored content while chrome copy localizes', async () => {
    const authoredTitle = 'USER_TITLE_SHOULD_NOT_TRANSLATE'

    const wrapper = mount(ArticleCard, {
      props: {
        article: {
          id: 1,
          title: authoredTitle,
          summary: 'Author summary stays untouched.',
          coverUrl: '',
          authorName: 'Demo',
          publishTime: '2024-01-01T00:00:00.000Z',
          isTop: 0,
          viewCount: 12,
          commentCount: 3,
          tagList: [{ id: 1, name: 'Tag1' }],
        },
        variant: 'default',
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    expect(wrapper.text()).toContain(authoredTitle)
    expect(wrapper.text()).toContain(i18n.global.t('articleCard.views'))

    setLocale('zh-CN', { persist: false })
    await nextTick()

    expect(wrapper.text()).toContain(authoredTitle)
    expect(wrapper.text()).toContain('浏览')
  })
})

