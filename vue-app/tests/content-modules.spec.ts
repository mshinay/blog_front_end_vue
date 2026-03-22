import { beforeEach, describe, expect, it, vi } from 'vitest'

import { login, register } from '@/api/modules/user'
import {
  createArticle,
  getAdminArticleList,
  getArticleDetail,
  getArticleList,
} from '@/api/modules/article'
import { createComment, getAdminCommentList, getCommentList } from '@/api/modules/comment'

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

describe('content and auth api modules', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
  })

  it('posts login to standard auth endpoint', async () => {
    getMock.mockReset()
    postMock.mockResolvedValueOnce({ data: { data: { id: 1, username: 'demo', jwtToken: 'jwt' } } })

    const result = await login({ username: 'demo', password: '123456' })

    expect(postMock).toHaveBeenCalledWith('/api/users/login', {
      username: 'demo',
      password: '123456',
    })
    expect(result.jwtToken).toBe('jwt')
  })

  it('posts register to standard auth endpoint with trimmed optional fields', async () => {
    postMock.mockResolvedValueOnce({ data: { data: { id: 2, username: 'demo2', jwtToken: 'jwt2' } } })

    await register({
      username: ' demo2 ',
      email: ' demo2@example.com ',
      password: '123456',
      nickname: ' Demo ',
      avatarUrl: ' /avatar.png ',
      bio: ' hello ',
    })

    expect(postMock).toHaveBeenCalledWith('/api/users/register', {
      username: 'demo2',
      email: 'demo2@example.com',
      password: '123456',
      nickname: 'Demo',
      avatarUrl: '/avatar.png',
      bio: 'hello',
    })
  })

  it('requests article list with standard query filters and maps records', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          total: 1,
          records: [{ id: 101, title: 'Vue 3', authorId: 2, authorName: 'demo' }],
        },
      },
    })

    const result = await getArticleList({ authorId: 2, keyword: 'vue', page: 1, pageSize: 10 })

    expect(getMock).toHaveBeenCalledWith('/api/articles', {
      params: { authorId: 2, keyword: 'vue', page: 1, pageSize: 10 },
    })
    expect(result.records[0]?.title).toBe('Vue 3')
  })

  it('requests article detail and create through standard endpoints', async () => {
    getMock.mockResolvedValueOnce({ data: { data: { id: 101, title: 'Detail' } } })
    postMock.mockResolvedValueOnce({ data: { data: 101 } })
    const payload = {
      title: 'New Article',
      slug: 'new-article',
      summary: 'summary',
      coverUrl: '/cover.png',
      content: '# markdown',
      contentType: 'markdown' as const,
      categoryId: 1,
      tagIds: [1, 2],
      allowComment: 1 as const,
      status: 1 as const,
    }

    const detail = await getArticleDetail(101)
    const articleId = await createArticle(payload)

    expect(getMock).toHaveBeenCalledWith('/api/articles/101')
    expect(postMock).toHaveBeenCalledWith('/api/articles', payload)
    expect(detail.id).toBe(101)
    expect(articleId).toBe(101)
  })

  it('requests standard comment list and create comment', async () => {
    getMock.mockResolvedValueOnce({
      data: {
        data: {
          total: 1,
          records: [{ comment: { id: 1, content: 'hello' }, children: [] }],
        },
      },
    })
    postMock.mockResolvedValueOnce({ data: { data: null } })

    const list = await getCommentList(101, 1, 10)
    await createComment({
      articleId: 101,
      parentId: 0,
      rootId: 0,
      replyUserId: 0,
      replyToCommentId: 0,
      content: 'hello',
    })

    expect(getMock).toHaveBeenCalledWith('/api/comments', {
      params: { articleId: 101, page: 1, pageSize: 10 },
    })
    expect(postMock).toHaveBeenCalledWith('/api/comments', {
      articleId: 101,
      parentId: 0,
      rootId: 0,
      replyUserId: 0,
      replyToCommentId: 0,
      content: 'hello',
    })
    expect(list.records).toHaveLength(1)
  })

  it('requests standard admin article and comment lists', async () => {
    getMock.mockResolvedValueOnce({
      data: { data: { total: 1, records: [{ id: 101, title: 'Admin Article', status: 1 }] } },
    })
    getMock.mockResolvedValueOnce({
      data: { data: { total: 1, records: [{ commentId: 7, articleId: 101, status: 1 }] } },
    })

    const adminArticles = await getAdminArticleList({
      authorId: 2,
      status: 1,
      keyword: 'vue',
      page: 1,
      pageSize: 10,
    })
    const adminComments = await getAdminCommentList({
      articleId: 101,
      status: 1,
      keyword: 'hello',
      page: 1,
      pageSize: 10,
    })

    expect(getMock).toHaveBeenNthCalledWith(1, '/api/admin/articles', {
      params: { authorId: 2, status: 1, keyword: 'vue', page: 1, pageSize: 10 },
    })
    expect(getMock).toHaveBeenNthCalledWith(2, '/api/admin/comments', {
      params: { articleId: 101, status: 1, keyword: 'hello', page: 1, pageSize: 10 },
    })
    expect(adminArticles.records[0]?.title).toBe('Admin Article')
    expect(adminComments.records[0]?.commentId).toBe(7)
  })
})
