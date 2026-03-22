import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getPublicUser,
  updateUserProfile,
  uploadAvatar,
} from '@/api/modules/user'
import { getUserArticleList, searchUserArticles } from '@/api/modules/article'
import { getUserCommentList, searchUserComments } from '@/api/modules/comment'

const { getMock, postMock } = vi.hoisted(() => {
  return {
    getMock: vi.fn(),
    postMock: vi.fn(),
  }
})

vi.mock('@/api/client', () => {
  return {
    default: {
      get: getMock,
      post: postMock,
    },
    unwrapData: <T>(response: { data: { data: T } }) => response.data.data,
  }
})

describe('user/article/comment modules', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('calls getPublicUser endpoint', async () => {
    getMock.mockResolvedValueOnce({ data: { data: { id: 1, username: 'demo' } } })

    const user = await getPublicUser(1)

    expect(getMock).toHaveBeenCalledWith('/api/users/1')
    expect(user.username).toBe('demo')
  })

  it('posts profile updates', async () => {
    postMock.mockResolvedValueOnce({ data: { data: { id: 1, username: 'new-name' } } })

    const user = await updateUserProfile({ id: 1, username: 'new-name' })

    expect(postMock).toHaveBeenCalledWith('/user/update', { id: 1, username: 'new-name' })
    expect(user.username).toBe('new-name')
  })

  it('uploads avatar as form data', async () => {
    postMock.mockResolvedValueOnce({ data: { data: 'https://img.example/avatar.png' } })

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const result = await uploadAvatar(file)

    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock.mock.calls[0][0]).toBe('/common/upload')
    expect(postMock.mock.calls[0][1]).toBeInstanceOf(FormData)
    expect(result).toBe('https://img.example/avatar.png')
  })

  it('requests user article list and search', async () => {
    getMock.mockResolvedValue({ data: { data: { records: [], total: 0, page: 1, pageSize: 10 } } })

    await getUserArticleList(2, 1, 10)
    await searchUserArticles(2, 'vue', 1, 10)

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/articles', {
      params: { authorId: 2, page: 1, pageSize: 10 },
    })
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/articles', {
      params: { authorId: 2, keyword: 'vue', page: 1, pageSize: 10 },
    })
  })

  it('requests user comment list and search', async () => {
    getMock.mockResolvedValue({ data: { data: { records: [], total: 0, page: 1, pageSize: 10 } } })

    await getUserCommentList(3, 1, 10)
    await searchUserComments(3, 'markdown', 1, 10)

    expect(getMock).toHaveBeenNthCalledWith(1, '/comment/user', {
      params: { userId: 3, page: 1, pageSize: 10 },
    })
    expect(getMock).toHaveBeenNthCalledWith(2, '/comment/user/search', {
      params: { userId: 3, keyword: 'markdown', page: 1, pageSize: 10 },
    })
  })
})
