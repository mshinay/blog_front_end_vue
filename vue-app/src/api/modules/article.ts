import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type { Article } from '@/types/article'

export interface ArticleMutationPayload {
  id?: number
  title: string
  content: string
}

export function getArticleList(page: number, pageSize: number): Promise<PageResult<Article>> {
  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/article/list', {
      params: { page, pageSize },
    })
    .then(unwrapData)
}

export function searchArticles(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<Article>> {
  return apiClient
    .get<ApiResponse<PageResult<Article>>>('/article/search', {
      params: { keyword, page, pageSize },
    })
    .then(unwrapData)
}

export function getArticleDetail(articleId: string | number): Promise<Article> {
  return apiClient.get<ApiResponse<Article>>(`/article/detail/${articleId}`).then(unwrapData)
}

export function createArticle(payload: ArticleMutationPayload): Promise<Article> {
  return apiClient.post<ApiResponse<Article>>('/article/upload', payload).then(unwrapData)
}

export function updateArticle(
  payload: Required<Pick<ArticleMutationPayload, 'id'>> & ArticleMutationPayload,
): Promise<Article> {
  return apiClient.post<ApiResponse<Article>>('/article/edit', payload).then(unwrapData)
}

export function deleteArticle(articleId: string | number): Promise<void> {
  return apiClient.delete<ApiResponse<null>>(`/article/${articleId}`).then(() => undefined)
}
