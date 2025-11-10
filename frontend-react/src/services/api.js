import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8066',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('fx:user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api