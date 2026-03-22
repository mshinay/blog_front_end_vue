import type { CategoryListItem } from './category'
import type { CommentNode } from './comment'
import type { TagListItem } from './tag'
import type { UserProfile } from './user'

export interface ArticleListItem {
  id: number
  title: string
  slug: string
  summary: string
  coverUrl: string
  authorId: number
  authorName: string
  categoryId: number
  categoryName: string
  categorySlug: string
  tagList: TagListItem[]
  publishTime: string
  isTop: number
  viewCount: number
  commentCount: number
}

export interface ArticleStats {
  viewCount: number
  likeCount: number
  commentCount: number
  favoriteCount: number
}

export interface ArticleDetail {
  id: number
  title: string
  slug: string
  summary: string
  coverUrl: string
  content: string
  contentType: string
  author: UserProfile
  category: CategoryListItem
  tags: TagListItem[]
  stats: ArticleStats
  allowComment: number
  publishTime: string
  updatedTime: string
  wordCount: number
  comments: CommentNode[]
}

export interface ArticlePermissionTarget {
  id: number
  authorId: number
}

export interface AdminArticleItem {
  id: number
  title: string
  slug: string
  authorId: number
  authorName: string
  categoryId: number
  categoryName: string
  status: number
  isTop: number
  allowComment: number
  publishTime: string
  updatedTime: string
  viewCount: number
  commentCount: number
  tagList: TagListItem[]
}

export interface ArticlePayload {
  title: string
  slug: string
  summary: string
  coverUrl: string
  content: string
  contentType: string
  categoryId: number
  tagIds: number[]
  allowComment: number
  status: number
}

export interface Article extends Partial<ArticleListItem>, Partial<ArticleDetail>, Partial<AdminArticleItem> {
  id: number
  title: string
  authorId?: number
  authorName?: string
  createTime?: string
}

export interface ArticleCardModel {
  id: number
  title: string
  slug?: string
  summary?: string
  coverUrl?: string
  authorName?: string
  publishTime?: string
  createTime?: string
  tagList?: TagListItem[]
}
