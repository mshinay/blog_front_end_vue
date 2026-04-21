import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { AppError } from '@/api/client'

const {
  getCommentListMock,
  createCommentMock,
  updateCommentMock,
  deleteCommentMock,
} = vi.hoisted(() => {
  return {
    getCommentListMock: vi.fn(),
    createCommentMock: vi.fn(),
    updateCommentMock: vi.fn(),
    deleteCommentMock: vi.fn(),
  }
})

vi.mock('@/api/modules/comment', () => {
  return {
    getCommentList: getCommentListMock,
    createComment: createCommentMock,
    updateComment: updateCommentMock,
    deleteComment: deleteCommentMock,
  }
})

import CommentList from '@/components/comment/CommentList.vue'

describe('CommentList', () => {
  let observers: Array<{
    active: boolean
    callback: (entries: Array<{ isIntersecting: boolean }>) => void
  }>

  beforeEach(() => {
    observers = []

    globalThis.IntersectionObserver = class {
      observerState: {
        active: boolean
        callback: (entries: Array<{ isIntersecting: boolean }>) => void
      }

      constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
        this.observerState = {
          active: true,
          callback,
        }
        observers.push(this.observerState)
      }

      observe() {}

      disconnect() {
        this.observerState.active = false
      }
    } as typeof IntersectionObserver

    setActivePinia(createPinia())
    const authStore = useAuthStore()
    authStore.setAuth('jwt-1', {
      id: 2,
      username: 'demo',
      nickname: 'Demo',
      avatarUrl: '/avatar.png',
      role: 1,
      status: 1,
      jwtToken: 'jwt-1',
    })

    getCommentListMock.mockReset()
    createCommentMock.mockReset()
    updateCommentMock.mockReset()
    deleteCommentMock.mockReset()
  })

  function triggerIntersection(): void {
    observers
      .filter((observer) => observer.active)
      .forEach((observer) => observer.callback([{ isIntersecting: true }]))
  }

  it('loads comments and posts new comment through standard payload', async () => {
    getCommentListMock
      .mockResolvedValueOnce({
        records: [
          {
            comment: { id: 1, articleId: 101, userId: 2, userName: 'demo', content: 'first' },
            children: [],
          },
        ],
      })
      .mockResolvedValueOnce({
        records: [
          {
            comment: { id: 1, articleId: 101, userId: 2, userName: 'demo', content: 'first' },
            children: [],
          },
        ],
      })
    createCommentMock.mockResolvedValueOnce(null)

    const wrapper = mount(CommentList, {
      props: { articleId: 101 },
      global: {
        stubs: {
          CommentEditor: {
            template: '<button data-testid="submit-comment" @click="$emit(\'submit\', \'new comment\')">post</button>',
          },
          CommentItem: {
            props: [
              'comment',
              'children',
              'canEdit',
              'canDelete',
              'isSaving',
              'isDeleting',
              'resolveCanEdit',
              'resolveCanDelete',
              'activeSavingId',
              'activeDeletingId',
            ],
            template: '<li data-testid="comment-item">{{ comment.content }}</li>',
          },
          EmptyState: { template: '<div data-testid="empty" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('[data-testid="submit-comment"]').trigger('click')
    await flushPromises()

    expect(getCommentListMock).toHaveBeenNthCalledWith(1, 101, 1, 10)
    expect(createCommentMock).toHaveBeenCalledWith({
      articleId: 101,
      parentId: 0,
      rootId: 0,
      replyUserId: 0,
      replyToCommentId: 0,
      content: 'new comment',
    })
    expect(getCommentListMock).toHaveBeenNthCalledWith(2, 101, 1, 10)
    expect(wrapper.text()).toContain('1 loaded')
  })

  it('updates and deletes existing comments in place', async () => {
    getCommentListMock.mockResolvedValueOnce({
      records: [
        {
          comment: { id: 1, articleId: 101, userId: 2, userName: 'demo', content: 'before' },
          children: [],
        },
      ],
    })
    updateCommentMock.mockResolvedValueOnce({ id: 1, content: 'after' })
    deleteCommentMock.mockResolvedValueOnce(undefined)

    const wrapper = mount(CommentList, {
      props: { articleId: 101 },
      global: {
        stubs: {
          CommentEditor: { template: '<div />' },
          CommentItem: {
            props: [
              'comment',
              'children',
              'canEdit',
              'canDelete',
              'isSaving',
              'isDeleting',
              'resolveCanEdit',
              'resolveCanDelete',
              'activeSavingId',
              'activeDeletingId',
            ],
            template:
              '<li data-testid="comment-item">{{ comment.content }}<button class="update-btn" @click="$emit(\'update\', { id: comment.id, content: \'after\' })">update</button><button class="delete-btn" @click="$emit(\'delete\', comment.id)">delete</button></li>',
          },
          EmptyState: { template: '<div data-testid="empty" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()
    await wrapper.get('.update-btn').trigger('click')
    await flushPromises()

    expect(updateCommentMock).toHaveBeenCalledWith({ id: 1, content: 'after' })
    expect(wrapper.text()).toContain('after')

    await wrapper.get('.delete-btn').trigger('click')
    await flushPromises()

    expect(deleteCommentMock).toHaveBeenCalledWith(1)
    expect(wrapper.findAll('[data-testid="comment-item"]')).toHaveLength(0)
  })

  it('stops auto retry after load failure until the user retries explicitly', async () => {
    getCommentListMock
      .mockRejectedValueOnce(new AppError('Failed to load comments.'))
      .mockResolvedValueOnce({
        records: [
          {
            comment: { id: 1, articleId: 101, userId: 2, userName: 'demo', content: 'recovered' },
            children: [],
          },
        ],
      })

    const wrapper = mount(CommentList, {
      props: { articleId: 101 },
      global: {
        stubs: {
          CommentEditor: { template: '<div />' },
          CommentItem: {
            props: [
              'comment',
              'children',
              'canEdit',
              'canDelete',
              'isSaving',
              'isDeleting',
              'resolveCanEdit',
              'resolveCanDelete',
              'activeSavingId',
              'activeDeletingId',
            ],
            template: '<li data-testid="comment-item">{{ comment.content }}</li>',
          },
          EmptyState: { template: '<div data-testid="empty" />' },
          LoadingState: { template: '<div data-testid="loading" />' },
        },
      },
    })

    await flushPromises()

    expect(getCommentListMock).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Failed to load comments.')

    triggerIntersection()
    await flushPromises()

    expect(getCommentListMock).toHaveBeenCalledTimes(1)

    await wrapper.get('.retry-btn').trigger('click')
    await flushPromises()

    expect(getCommentListMock).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('recovered')
  })
})
