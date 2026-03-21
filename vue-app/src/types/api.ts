export interface ApiResponse<T> {
  code: number
  message: string
  msg?: string
  data: T
}

export interface ListResult<T> {
  records: T[]
  total: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  pageSize: number
}

export interface CategoryListItem {
  id: number
  name: string
  slug: string
}

export interface TagListItem {
  id: number
  name: string
  slug: string
}
