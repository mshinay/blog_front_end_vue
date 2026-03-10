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
      email: 'demo@example.com',
    })
  })

  it('shows validation error for invalid email and skips request', async () => {
    const wrapper = mount(AccountSettingsPanel)

    await wrapper.get('#setting-email').setValue('not-an-email')
    await wrapper.findAll('form')[1].trigger('submit')

    expect(updateUserProfileMock).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Please enter a valid email address.')
  })

  it('updates username and syncs auth store', async () => {
    updateUserProfileMock.mockResolvedValueOnce({
      id: 1,
      username: 'updated-name',
      email: 'demo@example.com',
      jwtToken: 'token-2',
    })

    const wrapper = mount(AccountSettingsPanel)
    const store = useAuthStore()

    await wrapper.get('#setting-username').setValue('updated-name')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()

    expect(updateUserProfileMock).toHaveBeenCalledWith({
      id: 1,
      username: 'updated-name',
    })
    expect(store.currentUser?.username).toBe('updated-name')
    expect(localStorage.getItem('jwt')).toBe('token-2')
    expect(wrapper.text()).toContain('username updated successfully.')
  })
})
