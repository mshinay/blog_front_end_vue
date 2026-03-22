import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { routeState, pushMock, getArticleDetailMock, deleteArticleMock } = vi.hoisted(() => {
  return {
    routeState: {
      params: {} as Record<string, unknown>,
    },
    pushMock: vi.fn(),
    getArticleDetailMock: vi.fn(),
    deleteArticleMock: vi.fn(),
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
    getArticleDetail: getArticleDetailMock,
    deleteArticle: deleteArticleMock,
  }
})

import ArticleDetailView from '@/views/ArticleDetailView.vue'

describe('ArticleDetailView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.setAuth('jwt-1', {
      id: 1,
      username: 'author',
      nickname: 'Author',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      jwtToken: 'jwt-1',
    })

    routeState.params = { articleId: '101' }
    pushMock.mockReset()
    getArticleDetailMock.mockReset()
    deleteArticleMock.mockReset()
  })

  it('loads article detail and renders comment list when comments are enabled', async () => {
    getArticleDetailMock.mockResolvedValueOnce({
      id: 101,
      title: 'Vue Article',
      content: '# hello',
      summary: 'summary',
      publishTime: '2026-03-20',
      updatedTime: '2026-03-21',
      allowComment: 1,
      author: { id: 1, username: 'author', nickname: 'Author' },
      category: { id: 1, name: 'Frontend', slug: 'frontend' },
      tags: [{ id: 1, name: 'Vue', slug: 'vue' }],
      stats: { viewCount: 10, likeCount: 2, commentCount: 3, favoriteCount: 1 },
    })

    const wrapper = mount(ArticleDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          CommentList: { template: '<div data-testid="comment-list" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()

    expect(getArticleDetailMock).toHaveBeenCalledWith('101')
    expect(wrapper.text()).toContain('Vue Article')
    expect(wrapper.find('[data-testid="comment-list"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('Comments are disabled')
  })

  it('shows disabled message when article comments are closed', async () => {
    getArticleDetailMock.mockResolvedValueOnce({
      id: 101,
      title: 'Vue Article',
      content: '# hello',
      allowComment: 0,
      author: { id: 2, username: 'other' },
      stats: { viewCount: 0, likeCount: 0, commentCount: 0, favoriteCount: 0 },
    })

    const wrapper = mount(ArticleDetailView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          CommentList: { template: '<div data-testid="comment-list" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Comments are disabled for this article.')
    expect(wrapper.find('[data-testid="comment-list"]').exists()).toBe(false)
  })
})
