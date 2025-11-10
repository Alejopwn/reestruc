import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ParticlesBackground from '../components/common/ParticlesBackground'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    const result = await login(formData.email, formData.password)
    setLoading(false)

    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="auth-container">
      {/* Fondo de partículas animadas */}
      <ParticlesBackground 
        particleCount={80}
        colors={[
          'rgba(231, 76, 60,',   // Rojo FireX
          'rgba(243, 156, 18,',  // Naranja
          'rgba(241, 196, 15,'   // Amarillo
        ]}
        speed="medium"
      />

      <div className="auth-card animate-scale-in">
        {/* Logo animado */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h1 className="fire-glow" style={{ fontSize: '3rem', margin: 0 }}>
            🔥
          </h1>
        </div>
        
        <h1 className="animate-fade-in-down">FireX Hub</h1>
        <h2 
          className="animate-fade-in delay-100" 
          style={{ textAlign: 'center', marginBottom: '2rem', color: '#7f8c8d' }}
        >
          Iniciar Sesión
        </h2>

        {error && (
          <div className="alert error shake" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group animate-fade-in delay-200">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              disabled={loading}
              className="hover-scale"
            />
          </div>

          <div className="form-group animate-fade-in delay-300">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={loading}
              className="hover-scale"
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary animate-fade-in delay-400 ${loading ? 'btn-loading' : ''}`}
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                Iniciando sesión
                <span className="spinner" style={{ marginLeft: '8px' }}></span>
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="auth-footer animate-fade-in delay-500">
          ¿No tienes cuenta? <Link to="/register" className="hover-glow">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  )
}