import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type {
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

export type AdminCommentRecord = AdminCommentItem

export function getAdminCommentList(
  page: number,
  pageSize: number,
  filters?: {
    userId?: number
    articleId?: number
    status?: number
    keyword?: string
  },
): Promise<PageResult<AdminCommentRecord>> {
  return apiClient
    .get<ApiResponse<PageResult<AdminCommentRecord>>>('/api/admin/comments', {
      params: { ...filters, page, pageSize },
    })
    .then(unwrapData)
}

export function searchAdminComments(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<AdminCommentRecord>> {
  return getAdminCommentList(page, pageSize, { keyword })
}

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
