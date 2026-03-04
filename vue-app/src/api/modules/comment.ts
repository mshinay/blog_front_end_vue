import apiClient from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type { CommentItem } from '@/types/comment'

export function getCommentList(articleId: string | number, page: number, pageSize: number) {
  return apiClient.get<ApiResponse<PageResult<CommentItem>>>('/comment/list', {
    params: { articleId, page, pageSize },
  })
}
