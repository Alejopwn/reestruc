import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ParticlesBackground from '../components/common/ParticlesBackground'

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.address) {
      setError('Por favor completa todos los campos')
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
      navigate('/login')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="auth-container">
      {/* Fondo de partículas con colores diferentes */}
      <ParticlesBackground 
        particleCount={80}
        colors={[
          'rgba(52, 152, 219,',   // Azul
          'rgba(155, 89, 182,',   // Púrpura
          'rgba(46, 204, 113,'    // Verde
        ]}
        speed="medium"
      />

      <div className="auth-card animate-scale-in">
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
          Crear Cuenta
        </h2>

        {error && (
          <div className="alert error shake" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group animate-fade-in delay-200">
            <label htmlFor="name">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Alejandro Santamaria"
              disabled={loading}
            />
          </div>

          <div className="form-group animate-fade-in delay-250">
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
              minLength="6"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          <div className="form-group animate-fade-in delay-350">
            <label htmlFor="phone">Teléfono</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="3001234567"
              disabled={loading}
            />
          </div>

          <div className="form-group animate-fade-in delay-400">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Calle 123 #45-67"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={`btn btn-primary animate-fade-in delay-450 ${loading ? 'btn-loading' : ''}`}
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer animate-fade-in delay-500">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  )
}