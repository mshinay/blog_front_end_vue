import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { routeState, pushMock, getArticleListMock } = vi.hoisted(() => {
  return {
    routeState: {
      query: {} as Record<string, unknown>,
    },
    pushMock: vi.fn(),
    getArticleListMock: vi.fn(),
  }
})

vi.mock('vue-router', () => {
  return {
    useRoute: () => routeState,
    useRouter: () => ({
      push: pushMock,
    }),
  }
})

vi.mock('@/api/modules/article', () => {
  return {
    getArticleList: getArticleListMock,
  }
})

vi.mock('@/composables/useInfiniteScroll', () => {
  return {
    useInfiniteScroll: vi.fn(),
  }
})

import SearchView from '@/views/SearchView.vue'

describe('SearchView', () => {
  beforeEach(() => {
    routeState.query = {}
    pushMock.mockReset()
    getArticleListMock.mockReset()
  })

  it('loads results from route query and applies the shared article-card rhythm', async () => {
    routeState.query = { q: 'vue' }
    getArticleListMock.mockResolvedValueOnce({
      records: [
        { id: 1, title: 'One', summary: 'A', authorName: 'Author', publishTime: '2026-03-20' },
        { id: 2, title: 'Two', summary: 'B', authorName: 'Author', publishTime: '2026-03-20' },
        { id: 3, title: 'Three', summary: 'C', authorName: 'Author', publishTime: '2026-03-20' },
        { id: 4, title: 'Four', summary: 'D', authorName: 'Author', publishTime: '2026-03-20' },
      ],
    })

    const wrapper = mount(SearchView, {
      global: {
        stubs: {
          ArticleCard: {
            props: ['article', 'variant'],
            template: '<div class="article-card-stub" :data-variant="variant">{{ article.title }}</div>',
          },
          EmptyState: {
            props: ['eyebrow', 'title', 'message'],
            template: '<div data-testid="empty-state">{{ eyebrow }} {{ title }} {{ message }}</div>',
          },
          LoadingState: {
            props: ['eyebrow', 'title', 'message'],
            template: '<div data-testid="loading-state">{{ eyebrow }} {{ title }} {{ message }}</div>',
          },
        },
      },
    })

    await flushPromises()

    expect(getArticleListMock).toHaveBeenCalledWith(1, 10, { keyword: 'vue' })
    expect(wrapper.text()).toContain('Results for "vue"')
    expect(wrapper.findAll('.article-card-stub')).toHaveLength(4)
    expect(wrapper.findAll('[data-variant="featured"]')).toHaveLength(1)
    expect(wrapper.findAll('[data-variant="default"]')).toHaveLength(2)
    expect(wrapper.findAll('[data-variant="compact"]')).toHaveLength(1)
  })

  it('shows a designed prompt before a query is entered', async () => {
    const wrapper = mount(SearchView, {
      global: {
        stubs: {
          ArticleCard: true,
          EmptyState: {
            props: ['eyebrow', 'title', 'message'],
            template: '<div data-testid="empty-state">{{ eyebrow }} {{ title }} {{ message }}</div>',
          },
          LoadingState: true,
        },
      },
    })

    await flushPromises()

    expect(getArticleListMock).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Start Here')
  })

  it('pushes the keyword into the search route when submitting', async () => {
    const wrapper = mount(SearchView, {
      global: {
        stubs: {
          ArticleCard: true,
          EmptyState: true,
          LoadingState: true,
        },
      },
    })

    await wrapper.get('#search-keyword').setValue('vite')
    await wrapper.get('form').trigger('submit.prevent')

    expect(pushMock).toHaveBeenCalledWith({
      name: 'search',
      query: { q: 'vite' },
    })
  })
})
