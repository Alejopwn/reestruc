import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check localStorage for existing user
    const storedUser = localStorage.getItem('fx:user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('fx:user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/users/login', { email, password })
      
      if (response.data.success && response.data.user) {
        const userData = response.data.user
        setUser(userData)
        setIsAuthenticated(true)
        localStorage.setItem('fx:user', JSON.stringify(userData))
        
        // Redirect based on role
        if (userData.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/')
        }
        
        return { success: true }
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Credenciales incorrectas' 
        }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      }
    }
  }

  const register = async (userData) => {
    try {
      await api.post('/api/users/add', {
        ...userData,
        role: 'USER'
      })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al registrarse' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('fx:user')
    navigate('/login')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN'
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}