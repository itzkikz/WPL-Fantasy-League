// src/api/client.ts
import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'


const apiClient = axios.create({
  baseURL: import.meta.env.API_BASE_URL || 'https://wpl-fantasy-league.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('authToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    
    if (error.response?.status === 500) {
      console.error('Server error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default apiClient;