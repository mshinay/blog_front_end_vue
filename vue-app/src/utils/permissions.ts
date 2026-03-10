import type { Article } from '@/types/article'
import type { CommentItem } from '@/types/comment'
import type { User } from '@/types/user'

export function isAdminUser(user: User | null | undefined): boolean {
  return user?.role === 0
}

export function canEditArticle(user: User | null | undefined, article: Article | null | undefined): boolean {
  if (!user || !article) {
    return false
  }

  return user.id === article.authorId
}

export function canDeleteArticle(user: User | null | undefined, article: Article | null | undefined): boolean {
  if (!user || !article) {
    return false
  }

  return user.id === article.authorId || isAdminUser(user)
}

export function canEditComment(user: User | null | undefined, comment: CommentItem | null | undefined): boolean {
  if (!user || !comment) {
    return false
  }

  return user.id === comment.userId
}

export function canDeleteComment(
  user: User | null | undefined,
  comment: CommentItem | null | undefined,
): boolean {
  if (!user || !comment) {
    return false
  }

  return user.id === comment.userId || isAdminUser(user)
}
