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
  contentType: 'markdown' | 'html'
  author: UserProfile
  category: CategoryListItem
  tags: TagListItem[]
  stats: ArticleStats
  allowComment: 0 | 1
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
  status: 0 | 1 | 2
  isTop: number
  allowComment: 0 | 1
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
  contentType: 'markdown' | 'html'
  categoryId: number
  tagIds: number[]
  allowComment: 0 | 1
  status: 0 | 1 | 2
}

export interface ArticleUpdatePayload extends ArticlePayload {
  id: number
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
  categoryName?: string
  categorySlug?: string
  publishTime?: string
  createTime?: string
  tagList?: TagListItem[]
  isTop?: number
  viewCount?: number
  commentCount?: number
}
