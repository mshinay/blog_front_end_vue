import { describe, expect, it } from 'vitest'

import {
  canDeleteArticle,
  canDeleteComment,
  canEditArticle,
  canEditComment,
} from '@/utils/permissions'

describe('permissions', () => {
  const author = { id: 1, username: 'author', role: 1 }
  const admin = { id: 2, username: 'admin', role: 0 }
  const reader = { id: 3, username: 'reader', role: 1 }

  const article = { id: 101, title: 'title', authorId: 1 }
  const comment = { id: 201, articleId: 101, content: 'text', userId: 1 }

  it('allows only author to edit article', () => {
    expect(canEditArticle(author, article)).toBe(true)
    expect(canEditArticle(admin, article)).toBe(false)
    expect(canEditArticle(reader, article)).toBe(false)
  })

  it('allows author or admin to delete article', () => {
    expect(canDeleteArticle(author, article)).toBe(true)
    expect(canDeleteArticle(admin, article)).toBe(true)
    expect(canDeleteArticle(reader, article)).toBe(false)
  })

  it('allows only comment owner to edit comment', () => {
    expect(canEditComment(author, comment)).toBe(true)
    expect(canEditComment(admin, comment)).toBe(false)
    expect(canEditComment(reader, comment)).toBe(false)
  })

  it('allows comment owner or admin to delete comment', () => {
    expect(canDeleteComment(author, comment)).toBe(true)
    expect(canDeleteComment(admin, comment)).toBe(true)
    expect(canDeleteComment(reader, comment)).toBe(false)
  })
})
