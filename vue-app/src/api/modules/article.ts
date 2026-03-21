import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type { Article } from '@/types/article'

export interface ArticleMutationPayload {
  id?: number
  title: string
  slug?: string
  summary?: string
  coverUrl?: string
  content: string
  contentType?: string
  categoryId?: number
  tagIds?: number[]
  allowComment?: number
  status?: number
}

export interface ArticleListQuery {
  categoryId?: number
  tagId?: number
  authorId?: number
  slug?: string
  keyword?: string
  page: number
  pageSize: number
}

export interface AdminArticleListQuery {
  authorId?: number
  categoryId?: number
  tagId?: number
  status?: number
  allowComment?: number
  isTop?: number
  slug?: string
  keyword?: string
  page: number
  pageSize: number
}

type ArticleListFilters = Omit<ArticleListQuery, 'page' | 'pageSize'>
type AdminArticleListFilters = Omit<AdminArticleListQuery, 'page' | 'pageSize'>

function resolveArticleListQuery(
  pageOrQuery: number | ArticleListQuery,
  pageSize?: number,
  filters: ArticleListFilters = {},
): ArticleListQuery {
  if (typeof pageOrQuery === 'number') {
    return {
      ...filters,
      page: pageOrQuery,
      pageSize: pageSize ?? 10,
    }
  }

  return pageOrQuery
}

function resolveAdminArticleListQuery(
  pageOrQuery: number | AdminArticleListQuery,
  pageSize?: number,
  filters: AdminArticleListFilters = {},
): AdminArticleListQuery {
  if (typeof pageOrQuery === 'number') {
    return {
      ...filters,
      page: pageOrQuery,
      pageSize: pageSize ?? 10,
    }
  }

  return pageOrQuery
}

export function getArticleList(page: number, pageSize: number, filters?: ArticleListFilters): Promise<PageResult<Article>>
export function getArticleList(query: ArticleListQuery): Promise<PageResult<Article>>
export function getArticleList(
  pageOrQuery: number | ArticleListQuery,
  pageSize?: number,
  filters?: ArticleListFilters,
): Promise<PageResult<Article>> {
  const params = resolveArticleListQuery(pageOrQuery, pageSize, filters)

  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/api/articles', {
      params,
    })
    .then(unwrapData)
}

export function searchArticles(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<Article>> {
  return getArticleList(page, pageSize, { keyword })
}

export function getArticleDetail(articleId: string | number): Promise<Article> {
  return apiClient.get<ApiResponse<Article>>(`/api/articles/${articleId}`).then(unwrapData)
}

export function createArticle(payload: ArticleMutationPayload): Promise<number> {
  return apiClient.post<ApiResponse<number>>('/api/articles', payload).then(unwrapData)
}

export function updateArticle(
  payload: Required<Pick<ArticleMutationPayload, 'id'>> & ArticleMutationPayload,
): Promise<Article> {
  return apiClient.post<ApiResponse<Article>>('/article/edit', payload).then(unwrapData)
}

export function deleteArticle(articleId: string | number): Promise<void> {
  return apiClient.delete<ApiResponse<null>>(`/api/articles/${articleId}`).then(() => undefined)
}

export function getAdminArticleList(
  page: number,
  pageSize: number,
  filters?: AdminArticleListFilters,
): Promise<PageResult<Article>>
export function getAdminArticleList(query: AdminArticleListQuery): Promise<PageResult<Article>>
export function getAdminArticleList(
  pageOrQuery: number | AdminArticleListQuery,
  pageSize?: number,
  filters?: AdminArticleListFilters,
): Promise<PageResult<Article>> {
  const params = resolveAdminArticleListQuery(pageOrQuery, pageSize, filters)

  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/api/admin/articles', {
      params,
    })
    .then(unwrapData)
}

export function searchAdminArticles(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<Article>> {
  return getAdminArticleList(page, pageSize, { keyword })
}

export function getUserArticleList(
  authorId: string | number,
  page: number,
  pageSize: number,
): Promise<PageResult<Article>> {
  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/article/user', {
      params: { authorId, page, pageSize },
    })
    .then(unwrapData)
}

export function searchUserArticles(
  authorId: string | number,
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<Article>> {
  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/article/user/search', {
      params: { authorId, keyword, page, pageSize },
    })
    .then(unwrapData)
}
