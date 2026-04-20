import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import { AppError } from '@/api/client'

const { getArticleListMock } = vi.hoisted(() => ({
  getArticleListMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {},
  }),
}))

vi.mock('@/api/modules/article', () => ({
  getArticleList: getArticleListMock,
}))

import MainView from '@/views/MainView.vue'

describe('MainView', () => {
  let observers: Array<{
    active: boolean
    callback: (entries: Array<{ isIntersecting: boolean }>) => void
  }>

  beforeEach(() => {
    observers = []

    globalThis.IntersectionObserver = class {
      observerState: {
        active: boolean
        callback: (entries: Array<{ isIntersecting: boolean }>) => void
      }

      constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
        this.observerState = {
          active: true,
          callback,
        }
        observers.push(this.observerState)
      }

      observe() {}

      disconnect() {
        this.observerState.active = false
      }
    } as typeof IntersectionObserver

    getArticleListMock.mockReset()
  })

  function triggerIntersection(): void {
    observers
      .filter((observer) => observer.active)
      .forEach((observer) => observer.callback([{ isIntersecting: true }]))
  }

  it('preserves loaded articles and stops auto retry after a later page fails', async () => {
    getArticleListMock
      .mockResolvedValueOnce({
        records: [
          {
            id: 1,
            title: 'First article',
          },
        ],
      })
      .mockRejectedValueOnce(new AppError('Failed to load articles.'))
      .mockResolvedValueOnce({
        records: [
          {
            id: 2,
            title: 'Recovered article',
          },
        ],
      })

    const wrapper = mount(MainView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
          },
          ArticleCard: {
            props: ['article'],
            template: '<article data-testid="article-card">{{ article.title }}</article>',
          },
          EmptyState: { template: '<div data-testid="empty" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()

    expect(getArticleListMock).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('[data-testid="article-card"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('First article')

    triggerIntersection()
    await flushPromises()

    expect(getArticleListMock).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Failed to load articles.')
    expect(wrapper.findAll('[data-testid="article-card"]')).toHaveLength(1)

    triggerIntersection()
    await flushPromises()

    expect(getArticleListMock).toHaveBeenCalledTimes(2)

    await wrapper.get('.retry-btn').trigger('click')
    await flushPromises()

    expect(getArticleListMock).toHaveBeenCalledTimes(3)
    expect(wrapper.findAll('[data-testid="article-card"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('Recovered article')
  })
})
