export interface ApiResponse<T> {
  code: number
  message: string
  msg?: string
  data: T
}

export interface PageResult<T> {
  records: T[]
  total: number
  page?: number
  pageSize?: number
}

export type ListResult<T> = PageResult<T>

export type { CategoryListItem } from './category'
export type { TagListItem } from './tag'
