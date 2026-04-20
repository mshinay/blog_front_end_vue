import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { AppError } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const { routeState, pushMock } = vi.hoisted(() => {
  return {
    routeState: {
      query: {} as Record<string, unknown>,
    },
    pushMock: vi.fn(),
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

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'

describe('auth entry views', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    routeState.query = {}
    pushMock.mockReset()
  })

  it('submits login credentials and respects redirect query', async () => {
    routeState.query = { redirect: '/article/9' }
    const store = useAuthStore()
    const loginSpy = vi.spyOn(store, 'loginWithPassword').mockResolvedValue()

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.get('#login-username').setValue('reader')
    await wrapper.get('#login-password').setValue('secret')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(loginSpy).toHaveBeenCalledWith({
      username: 'reader',
      password: 'secret',
    })
    expect(pushMock).toHaveBeenCalledWith('/article/9')
    expect(wrapper.text()).toContain('Return to your reading desk.')
  })

  it('renders login app errors without changing navigation flow', async () => {
    const store = useAuthStore()
    vi.spyOn(store, 'loginWithPassword').mockRejectedValue(new AppError('Invalid credentials'))

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.get('#login-username').setValue('reader')
    await wrapper.get('#login-password').setValue('wrong')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Invalid credentials')
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('submits registration payload and trims optional fields', async () => {
    const store = useAuthStore()
    const registerSpy = vi.spyOn(store, 'registerAndLogin').mockResolvedValue()

    const wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.get('#register-username').setValue('writer')
    await wrapper.get('#register-email').setValue('writer@example.com')
    await wrapper.get('#register-nickname').setValue('  Draft Desk  ')
    await wrapper.get('#register-avatar').setValue('  https://example.com/avatar.jpg  ')
    await wrapper.get('#register-bio').setValue('  Notes about long-form writing.  ')
    await wrapper.get('#register-password').setValue('secret123')
    await wrapper.get('#register-confirm-password').setValue('secret123')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(registerSpy).toHaveBeenCalledWith({
      username: 'writer',
      email: 'writer@example.com',
      password: 'secret123',
      nickname: 'Draft Desk',
      avatarUrl: 'https://example.com/avatar.jpg',
      bio: 'Notes about long-form writing.',
    })
    expect(pushMock).toHaveBeenCalledWith('/main')
    expect(wrapper.text()).toContain('Open your author corner.')
  })

  it('blocks registration when passwords do not match', async () => {
    const store = useAuthStore()
    const registerSpy = vi.spyOn(store, 'registerAndLogin').mockResolvedValue()

    const wrapper = mount(RegisterView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.get('#register-username').setValue('writer')
    await wrapper.get('#register-email').setValue('writer@example.com')
    await wrapper.get('#register-password').setValue('secret123')
    await wrapper.get('#register-confirm-password').setValue('different')
    await wrapper.get('form').trigger('submit.prevent')

    expect(registerSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Passwords do not match.')
  })
})
