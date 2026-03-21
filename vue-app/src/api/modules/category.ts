import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, CategoryListItem, ListResult } from '@/types/api'

export function getCategoryList(): Promise<ListResult<CategoryListItem>> {
  return apiClient.get<ApiResponse<ListResult<CategoryListItem>>>('/api/categories').then(unwrapData)
}
