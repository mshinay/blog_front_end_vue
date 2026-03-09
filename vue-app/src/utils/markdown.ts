import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.setOptions({
  breaks: true,
  gfm: true,
})

export function renderMarkdown(content: string): string {
  const html = marked.parse(content ?? '', { async: false })
  return DOMPurify.sanitize(html)
}

export function markdownToPlainText(content: string): string {
  const html = renderMarkdown(content)
  const node = document.createElement('div')
  node.innerHTML = html
  return node.textContent?.trim() ?? ''
}
