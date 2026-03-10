import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

const { routeState, replaceMock } = vi.hoisted(() => {
  return {
    routeState: {
      query: {} as Record<string, unknown>,
    },
    replaceMock: vi.fn(async (location: { query?: Record<string, unknown> }) => {
      routeState.query = location.query ?? {}
      return true
    }),
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

import PersonCenterView from '@/views/PersonCenterView.vue'

describe('PersonCenterView', () => {
  beforeEach(() => {
    routeState.query = {}
    replaceMock.mockClear()
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
