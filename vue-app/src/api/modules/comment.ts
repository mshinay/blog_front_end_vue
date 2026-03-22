import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type {
  AdminCommentListQuery,
  AdminCommentItem,
  CommentNode,
  CommentRecord,
} from '@/types/comment'

export type CommentAuthorComment = CommentRecord

export interface CreateCommentPayload {
  articleId: number
  parentId: number
  rootId: number
  replyUserId: number
  replyToCommentId: number
  content: string
}

export interface UpdateCommentPayload {
  id: number
  content: string
}

export type CommentTreeNode = CommentNode

export function getCommentList(
  articleId: string | number,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentTreeNode>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentTreeNode>>>('/api/comments', {
      params: { articleId, page, pageSize },
    })
    .then(unwrapData)
}

export function createComment(
  payload: CreateCommentPayload,
): Promise<null> {
  return apiClient.post<ApiResponse<null>>('/api/comments', payload).then(unwrapData)
}

export function updateComment(payload: UpdateCommentPayload): Promise<CommentAuthorComment> {
  return apiClient.put<ApiResponse<CommentAuthorComment>>('/comment/update', payload).then(unwrapData)
}

export function deleteComment(commentId: string | number): Promise<void> {
  return apiClient.delete<ApiResponse<null>>(`/comment/${commentId}`).then(() => undefined)
}

type AdminCommentListFilters = Omit<AdminCommentListQuery, 'page' | 'pageSize'>

function resolveAdminCommentListQuery(
  pageOrQuery: number | AdminCommentListQuery,
  pageSize?: number,
  filters: AdminCommentListFilters = {},
): AdminCommentListQuery {
  if (typeof pageOrQuery === 'number') {
    return {
      ...filters,
      page: pageOrQuery,
      pageSize: pageSize ?? 10,
    }
  }

  return pageOrQuery
}

export function getAdminCommentList(
  page: number,
  pageSize: number,
  filters?: AdminCommentListFilters,
): Promise<PageResult<AdminCommentItem>>
export function getAdminCommentList(query: AdminCommentListQuery): Promise<PageResult<AdminCommentItem>>
export function getAdminCommentList(
  pageOrQuery: number | AdminCommentListQuery,
  pageSize?: number,
  filters?: AdminCommentListFilters,
): Promise<PageResult<AdminCommentItem>> {
  const params = resolveAdminCommentListQuery(pageOrQuery, pageSize, filters)

  return apiClient
    .get<ApiResponse<PageResult<AdminCommentItem>>>('/api/admin/comments', {
      params,
    })
    .then(unwrapData)
}

// Non-standard dependency point:
// the interface document does not define a standard "user comment list" endpoint,
// so personal-center comment history remains on legacy endpoints for now.
export function getUserCommentList(
  userId: string | number,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentAuthorComment>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentAuthorComment>>>('/comment/user', {
      params: { userId, page, pageSize },
    })
    .then(unwrapData)
}

// Non-standard dependency point:
// keyword search for user comments also depends on the same legacy user-comment API family.
export function searchUserComments(
  userId: string | number,
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentAuthorComment>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentAuthorComment>>>('/comment/user/search', {
      params: { userId, keyword, page, pageSize },
    })
    .then(unwrapData)
}
