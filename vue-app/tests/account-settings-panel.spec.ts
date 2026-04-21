import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import { useAuthStore } from '@/stores/auth'
import AccountSettingsPanel from '@/components/person/AccountSettingsPanel.vue'

const { updateUserProfileMock, uploadAvatarMock } = vi.hoisted(() => {
  return {
    updateUserProfileMock: vi.fn(),
    uploadAvatarMock: vi.fn(),
  }
})

vi.mock('@/api/modules/user', () => {
  return {
    updateUserProfile: updateUserProfileMock,
    uploadAvatar: uploadAvatarMock,
  }
})

describe('AccountSettingsPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    updateUserProfileMock.mockReset()
    uploadAvatarMock.mockReset()

    const store = useAuthStore()
    store.setAuth('token-1', {
      id: 1,
      username: 'demo',
      nickname: 'Demo',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      jwtToken: 'token-1',
    })
  })

  it('shows validation error for empty nickname and skips request', async () => {
    const wrapper = mount(AccountSettingsPanel, {
      props: {
        profile: {
          id: 1,
          username: 'demo',
          nickname: 'Demo',
          avatarUrl: '/avatar.png',
          bio: 'old bio',
        },
      },
    })

    await wrapper.get('#setting-nickname').setValue('')
    await wrapper.findAll('form')[0].trigger('submit')

    expect(updateUserProfileMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Input cannot be empty.')
  })

  it('updates nickname and syncs auth store', async () => {
    updateUserProfileMock.mockResolvedValueOnce({
      id: 1,
      username: 'demo',
      nickname: 'Updated Name',
      avatarUrl: '/avatar.png',
      bio: 'old bio',
    })

    const wrapper = mount(AccountSettingsPanel, {
      props: {
        profile: {
          id: 1,
          username: 'demo',
          nickname: 'Demo',
          avatarUrl: '/avatar.png',
          bio: 'old bio',
        },
      },
    })
    const store = useAuthStore()

    await wrapper.get('#setting-nickname').setValue('Updated Name')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()

    expect(updateUserProfileMock).toHaveBeenCalledWith({
      userId: 1,
      nickname: 'Updated Name',
    })
    expect(store.currentUser?.nickname).toBe('Updated Name')
    expect(localStorage.getItem('jwt')).toBe('token-1')
    expect(wrapper.text()).toContain('nickname updated successfully.')
  })
})
