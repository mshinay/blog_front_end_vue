import { describe, expect, it } from 'vitest'

import { resolvePersonTab } from '@/utils/person-tabs'

describe('resolvePersonTab', () => {
  it('returns supported tab values', () => {
    expect(resolvePersonTab('account')).toBe('account')
    expect(resolvePersonTab('articles')).toBe('articles')
    expect(resolvePersonTab('comments')).toBe('comments')
  })

  it('falls back to account for unsupported values', () => {
    expect(resolvePersonTab('admin')).toBe('account')
    expect(resolvePersonTab(undefined)).toBe('account')
    expect(resolvePersonTab(['articles'])).toBe('account')
  })
})
