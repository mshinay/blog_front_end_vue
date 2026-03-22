import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import CommentItem from '@/components/comment/CommentItem.vue'

describe('CommentItem', () => {
  it('renders markdown content', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: {
          id: 1,
          articleId: 1,
          userId: 2,
          userName: 'demo',
          content: '**hello**',
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.html()).toContain('<strong>hello</strong>')
  })

  it('emits delete when delete button clicked', async () => {
    const wrapper = mount(CommentItem, {
      props: {
        canDelete: true,
        comment: {
          id: 7,
          articleId: 1,
          userId: 2,
          userName: 'demo',
          content: 'sample',
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await wrapper.get('button.danger').trigger('click')

    expect(wrapper.emitted('delete')?.[0]).toEqual([7])
  })

  it('does not render edit button without canEdit', () => {
    const wrapper = mount(CommentItem, {
      props: {
        canDelete: true,
        comment: {
          id: 8,
          articleId: 1,
          userId: 2,
          userName: 'demo',
          content: 'sample',
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.find('button.ghost').exists()).toBe(false)
    expect(wrapper.find('button.danger').exists()).toBe(true)
  })

  it('renders reply label and createdTime when present', () => {
    const wrapper = mount(CommentItem, {
      props: {
        comment: {
          id: 9,
          articleId: 1,
          userId: 2,
          userName: 'demo',
          content: 'reply body',
          replyUserName: 'author',
          replyToCommentId: 5,
          createdTime: '2026-03-20T10:00:00',
        },
      },
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('Reply @author')
    expect(wrapper.text()).toContain('#5')
    expect(wrapper.text()).toContain('2026-03-20T10:00:00')
  })
})
