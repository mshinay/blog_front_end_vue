import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { setLocale } from '@/i18n'

const { routeState, getPublicUserMock, getUserArticleListMock, searchUserArticlesMock } = vi.hoisted(() => {
  return {
    routeState: {
      params: { userId: '2' } as Record<string, unknown>,
    },
    getPublicUserMock: vi.fn(),
    getUserArticleListMock: vi.fn(),
    searchUserArticlesMock: vi.fn(),
  }
})

vi.mock('vue-router', () => {
  return {
    useRoute: () => routeState,
  }
})

vi.mock('@/api/modules/user', () => {
  return {
    getPublicUser: getPublicUserMock,
  }
})

vi.mock('@/api/modules/article', () => {
  return {
    getUserArticleList: getUserArticleListMock,
    searchUserArticles: searchUserArticlesMock,
  }
})

vi.mock('@/composables/useInfiniteScroll', () => {
  return {
    useInfiniteScroll: () => undefined,
  }
})

import UserPageView from '@/views/UserPageView.vue'

describe('UserPageView', () => {
  beforeEach(() => {
    setLocale('en', { persist: false })
    routeState.params = { userId: '2' }
    getPublicUserMock.mockReset()
    getUserArticleListMock.mockReset()
    searchUserArticlesMock.mockReset()

    getPublicUserMock.mockResolvedValue({
      id: 2,
      username: 'author',
      nickname: 'Author',
      avatarUrl: '',
      bio: '',
    })
    getUserArticleListMock.mockResolvedValue({ records: [] })
  })

  it('renders localized chrome copy and keeps authored user data untouched across locale switch', async () => {
    const wrapper = mount(UserPageView, {
      global: {
        stubs: {
          ArticleCard: { template: '<div data-testid="article-card" />' },
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Search')
    expect(wrapper.text()).toContain('This user has not added a bio yet.')
    expect(wrapper.text()).toContain('No public articles found for this user.')
    expect(wrapper.text()).toContain('@author')

    setLocale('zh-CN', { persist: false })
    await nextTick()

    expect(wrapper.text()).toContain('搜索')
    expect(wrapper.text()).toContain('该用户还没有填写简介。')
    expect(wrapper.text()).toContain('该用户暂无公开文章。')
    expect(wrapper.text()).toContain('@author')
  })
})

