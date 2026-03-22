export interface CommentRecord {
  id: number
  articleId: number
  userId: number
  userName: string
  userAvatarUrl?: string
  content: string
  parentId: number
  rootId: number
  replyUserId?: number | null
  replyUserName?: string | null
  replyToCommentId?: number | null
  likeCount: number
  status: number
  createdTime: string
  updatedTime: string
}

export interface CommentNode {
  comment: CommentRecord
  children: CommentRecord[]
}

export interface AdminCommentItem {
  commentId: number
  articleId: number
  articleTitle: string
  articleStatus: 0 | 1 | 2
  userId: number
  userName: string
  replyUserId?: number | null
  replyUserName?: string | null
  content: string
  status: 0 | 1 | 2
  rootId: number
  parentId: number
  createdTime: string
  updatedTime: string
}

export interface AdminCommentListQuery {
  userId?: number
  articleId?: number
  status?: 0 | 1 | 2
  keyword?: string
  page: number
  pageSize: number
}

export interface CommentItem extends Partial<CommentRecord> {
  id: number
  content: string
  articleId: number
  userId: number
  userName?: string
  username?: string
  createTime?: string
  replyUserName?: string | null
  replyToCommentId?: number | null
  children?: CommentItem[]
  status?: number
}
