export interface Article {
  id: number
  title: string
  summary?: string
  content?: string
  authorId?: number
  authorName?: string
  status?: number
  createTime?: string
}
