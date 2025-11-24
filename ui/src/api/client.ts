// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 100000,
  headers: { 'Content-Type': 'application/json' },
})

// Request: attach token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Helpers to extract server response safely
function getErrorPayload(err: AxiosError) {
  // Prefer server-provided payload if present
  return err.response?.data ?? { message: err.message }
}

// Response: propagate server response on errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 401: clear token, optionally redirect
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // window.location.href = '/login'
    }

    // 500: log, but still propagate server response
    if (error.response?.status === 500) {
      console.error('Server error:', error.message)
    }

    // EITHER: rethrow the original AxiosError (callers can read error.response/data)
    // return Promise.reject(error)

    // OR: rethrow with the server payload to simplify callers
    const payload = getErrorPayload(error)
    return Promise.reject({ ...error, data: payload, response: error.response })
  }
)

export default apiClient
