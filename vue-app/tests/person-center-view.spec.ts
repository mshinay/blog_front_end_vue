import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'

const { routeState, replaceMock, getPublicUserMock } = vi.hoisted(() => {
  return {
    routeState: {
      query: {} as Record<string, unknown>,
      params: {} as Record<string, unknown>,
    },
    replaceMock: vi.fn(async (location: { query?: Record<string, unknown> }) => {
      routeState.query = location.query ?? {}
      return true
    }),
    getPublicUserMock: vi.fn(),
  }
})

vi.mock('vue-router', () => {
  return {
    useRoute: () => routeState,
    useRouter: () => ({
      replace: replaceMock,
    }),
  }
})

vi.mock('@/api/modules/user', () => {
  return {
    getPublicUser: getPublicUserMock,
  }
})

import PersonCenterView from '@/views/PersonCenterView.vue'

describe('PersonCenterView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.setAuth('token-1', {
      id: 1,
      username: 'demo',
      nickname: 'Demo User',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      jwtToken: 'token-1',
    })
    routeState.query = {}
    routeState.params = {}
    replaceMock.mockClear()
    getPublicUserMock.mockReset()
    getPublicUserMock.mockResolvedValue({
      id: 1,
      username: 'demo',
      nickname: 'Demo User',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      bio: 'bio',
    })
  })

  it('renders articles tab panel from query', async () => {
    routeState.query = { tab: 'articles' }

    const wrapper = mount(PersonCenterView, {
      global: {
        stubs: {
          AccountSettingsPanel: { template: '<div data-testid="account-panel" />' },
          MyArticlesPanel: { template: '<div data-testid="articles-panel" />' },
          MyCommentsPanel: { template: '<div data-testid="comments-panel" />' },
        },
      },
    })

    await flushPromises()

    expect(getPublicUserMock).toHaveBeenCalledWith(1)
    expect(wrapper.find('[data-testid="articles-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="account-panel"]').exists()).toBe(false)
  })

  it('normalizes invalid query tab to account', async () => {
    routeState.query = { tab: 'invalid' }

    const wrapper = mount(PersonCenterView, {
      global: {
        stubs: {
          AccountSettingsPanel: { template: '<div data-testid="account-panel" />' },
          MyArticlesPanel: { template: '<div data-testid="articles-panel" />' },
          MyCommentsPanel: { template: '<div data-testid="comments-panel" />' },
        },
      },
    })

    await flushPromises()

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'person-center',
      query: { tab: 'account' },
    })
    expect(wrapper.find('[data-testid="account-panel"]').exists()).toBe(true)
  })

  it('switches tab and syncs query via router.replace', async () => {
    routeState.query = { tab: 'account', keep: 'yes' }

    const wrapper = mount(PersonCenterView, {
      global: {
        stubs: {
          AccountSettingsPanel: { template: '<div data-testid="account-panel" />' },
          MyArticlesPanel: { template: '<div data-testid="articles-panel" />' },
          MyCommentsPanel: { template: '<div data-testid="comments-panel" />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('button.tab-btn:nth-of-type(3)').trigger('click')
    await flushPromises()

    expect(replaceMock).toHaveBeenCalledWith({
      name: 'person-center',
      query: {
        tab: 'comments',
        keep: 'yes',
      },
    })
  })
})
