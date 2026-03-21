import axios from 'axios'
import type { AxiosError, AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api'

interface ApiErrorPayload {
  code?: number
  message?: string
  msg?: string
}

export class AppError extends Error {
  status?: number
  code?: number

  constructor(message: string, options: { status?: number; code?: number } = {}) {
    super(message)
    this.name = 'AppError'
    this.status = options.status
    this.code = options.code
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')

  if (token) {
    config.headers.authentication = token
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data as ApiErrorPayload | undefined

    if (payload && typeof payload.code === 'number' && payload.code !== 0) {
      throw new AppError(payload.message || payload.msg || 'Request failed', {
        code: payload.code,
        status: response.status,
      })
    }

    return response
  },
  (error) => {
    const axiosError = error as AxiosError<ApiErrorPayload>

    if (axiosError.response?.status === 401) {
      localStorage.removeItem('jwt')
      localStorage.removeItem('user')
    }

    if (error instanceof AppError) {
      return Promise.reject(error)
    }

    const status = axiosError.response?.status
    const message =
      axiosError.response?.data?.message ||
      axiosError.response?.data?.msg ||
      axiosError.message ||
      'Network error, please try again later.'

    return Promise.reject(
      new AppError(message, {
        status,
      }),
    )
  },
)

export function unwrapData<T>(response: AxiosResponse<ApiResponse<T>>): T {
  return response.data.data
}

export default apiClient
