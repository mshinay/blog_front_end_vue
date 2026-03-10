import apiClient, { unwrapData } from '@/api/client'

import type { ApiResponse, PageResult } from '@/types/api'
import type { CommentItem } from '@/types/comment'

export interface CommentMutationPayload {
  id?: number
  articleId?: number
  content: string
}

export function getCommentList(
  articleId: string | number,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentItem>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentItem>>>('/comment/list', {
      params: { articleId, page, pageSize },
    })
    .then(unwrapData)
}

export function createComment(payload: Required<Pick<CommentMutationPayload, 'articleId'>> & CommentMutationPayload): Promise<CommentItem> {
  return apiClient.post<ApiResponse<CommentItem>>('/comment/upload', payload).then(unwrapData)
}

export function updateComment(payload: Required<Pick<CommentMutationPayload, 'id'>> & CommentMutationPayload): Promise<CommentItem> {
  return apiClient.put<ApiResponse<CommentItem>>('/comment/update', payload).then(unwrapData)
}

export function deleteComment(commentId: string | number): Promise<void> {
  return apiClient.delete<ApiResponse<null>>(`/comment/${commentId}`).then(() => undefined)
}

export interface AdminCommentGroup {
  articleId: number
  articleTitle: string
  comments: CommentItem[]
}

export function getAdminCommentList(
  page: number,
  pageSize: number,
): Promise<PageResult<AdminCommentGroup>> {
  return apiClient
    .get<ApiResponse<PageResult<AdminCommentGroup>>>('/comment/admin/list', {
      params: { page, pageSize },
    })
    .then(unwrapData)
}

export function searchAdminComments(
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<AdminCommentGroup>> {
  return apiClient
    .get<ApiResponse<PageResult<AdminCommentGroup>>>('/comment/admin/search', {
      params: { keyword, page, pageSize },
    })
    .then(unwrapData)
}

export function getUserCommentList(
  userId: string | number,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentItem>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentItem>>>('/comment/user', {
      params: { userId, page, pageSize },
    })
    .then(unwrapData)
}

export function searchUserComments(
  userId: string | number,
  keyword: string,
  page: number,
  pageSize: number,
): Promise<PageResult<CommentItem>> {
  return apiClient
    .get<ApiResponse<PageResult<CommentItem>>>('/comment/user/search', {
      params: { userId, keyword, page, pageSize },
    })
    .then(unwrapData)
}
