export interface CommentItem {
  id: number
  content: string
  articleId: number
  userId: number
  username?: string
  createTime?: string
  status?: number
}
