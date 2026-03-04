import apiClient from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type { Article } from '@/types/article'

export function getArticleList(page: number, pageSize: number) {
  return apiClient.get<ApiResponse<PageResult<Article>>>('/article/list', {
    params: { page, pageSize },
  })
}

export function getArticleDetail(articleId: string | number) {
  return apiClient.get<ApiResponse<Article>>(`/article/detail/${articleId}`)
}
