import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, ListResult, TagListItem } from '@/types/api'

export function getTagList(): Promise<ListResult<TagListItem>> {
  return apiClient.get<ApiResponse<ListResult<TagListItem>>>('/api/tags').then(unwrapData)
}
