import { describe, expect, it } from 'vitest'

import { markdownToPlainText, renderMarkdown } from '@/utils/markdown'

describe('markdown utils', () => {
  it('renders markdown syntax into safe html', () => {
    const html = renderMarkdown('# Title\n\n**bold** text')

    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
  })

  it('sanitizes script tags from markdown html', () => {
    const html = renderMarkdown('<script>alert(1)</script>hello')

    expect(html).not.toContain('<script>')
    expect(html).toContain('hello')
  })

  it('converts markdown to plain text', () => {
    const plain = markdownToPlainText('## Header\n\n- item')

    expect(plain).toContain('Header')
    expect(plain).toContain('item')
  })
})
