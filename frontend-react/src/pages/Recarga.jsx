import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import { useAuth } from '../contexts/AuthContext'
import { createRecarga, getTodayDate } from '../utils/helpers'

export default function Recarga() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    correo: user?.email || '',
    tipo: '',
    estado: '',
    fecha: '',
    franja: '',
    direccion: '',
    telefono: '',
    observaciones: '',
    notify: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const recargaData = {
      userEmail: formData.correo,
      userId: user?.id || null,
      tipo: formData.tipo,
      estadoExtintor: formData.estado,
      fecha: formData.fecha,
      franja: formData.franja,
      direccion: formData.direccion,
      telefono: formData.telefono,
      observaciones: formData.observaciones
    }

    try {
      const recargaId = createRecarga(recargaData)
      
      // TODO: Implementar notificaciones si formData.notify es true
      if (formData.notify) {
        console.log('Enviar notificación por email/WhatsApp')
      }

      alert(`¡Solicitud de recarga creada exitosamente!\n\nID: ${recargaId}\n\nNos pondremos en contacto contigo pronto.`)
      navigate(`/solicitudes?created=${recargaId}`)
    } catch (error) {
      alert('Error al crear la solicitud: ' + error.message)
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="card" style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h1>Solicitar Recarga de Extintor</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
            Complete el formulario para solicitar el servicio de recarga de su extintor
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico *</label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo de Extintor *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="ABC">ABC - Polvo Químico Seco</option>
                <option value="CO2">CO2 - Dióxido de Carbono</option>
                <option value="H2O">H2O - Agua</option>
                <option value="K">Clase K - Cocina</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado del Extintor *</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Operativo">Operativo</option>
                <option value="Descargado">Descargado</option>
                <option value="Vencido">Vencido</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha Preferida *</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                min={getTodayDate()}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="franja">Franja Horaria *</label>
              <select
                id="franja"
                name="franja"
                value={formData.franja}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione...</option>
                <option value="Mañana">Mañana (8:00 AM - 12:00 PM)</option>
                <option value="Tarde">Tarde (12:00 PM - 5:00 PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="direccion">Dirección de Servicio *</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                required
                placeholder="Calle 123 #45-67"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono de Contacto *</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                placeholder="3001234567"
              />
            </div>

            <div className="form-group">
              <label htmlFor="observaciones">Observaciones</label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Información adicional sobre el servicio..."
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="notify"
                  name="notify"
                  checked={formData.notify}
                  onChange={handleChange}
                />
                <span>Enviar notificación por email/WhatsApp</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Enviar Solicitud
            </button>
          </form>
        </div>
      </main>
    </>
  )
}