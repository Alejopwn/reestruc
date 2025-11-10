import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Header from '../components/common/Header'
import { useAuth } from '../contexts/AuthContext'
import { getRecargasByUser, getRecargaById, STATUS_COLORS } from '../utils/helpers'

export default function Solicitudes() {
  const { user } = useAuth()
  const location = useLocation()
  const [solicitudes, setSolicitudes] = useState([])
  const [selectedRecarga, setSelectedRecarga] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    loadSolicitudes()
    
    // Check if we just created a recarga
    const params = new URLSearchParams(location.search)
    const createdId = params.get('created')
    if (createdId) {
      showAlert(`Solicitud ${createdId} creada exitosamente`, 'success')
      // Clear URL parameter
      window.history.replaceState({}, '', '/solicitudes')
    }
  }, [location])

  const loadSolicitudes = () => {
    const userRecargas = getRecargasByUser(user.email)
    // Sort by creation date (newest first)
    const sorted = userRecargas.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
    setSolicitudes(sorted)
  }

  const showAlert = (message, type) => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  const handleShowDetail = (id) => {
    const recarga = getRecargaById(id)
    setSelectedRecarga(recarga)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRecarga(null)
  }

  if (solicitudes.length === 0) {
    return (
      <>
        <Header />
        <main className="container">
          <div className="card">
            <h1>Mis Solicitudes de Recarga</h1>
            
            {alert && (
              <div className={`alert ${alert.type}`} role="alert">
                {alert.message}
              </div>
            )}

            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
              <h3>No tienes solicitudes de recarga</h3>
              <p style={{ color: '#7f8c8d', margin: '1rem 0 2rem' }}>
                Crea tu primera solicitud para comenzar
              </p>
              <Link to="/recarga" className="btn btn-primary">
                Crear Nueva Recarga
              </Link>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="card">
          <h1>Mis Solicitudes de Recarga</h1>
          <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
            Aquí puedes ver el estado de todas tus solicitudes de recarga
          </p>

          {alert && (
            <div className={`alert ${alert.type}`} role="alert">
              {alert.message}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha Creación</th>
                  <th>Tipo</th>
                  <th>Franja</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Última Actualización</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.id}</strong></td>
                    <td>{new Date(s.createdAt).toLocaleDateString('es-CO')}</td>
                    <td>{s.tipo}</td>
                    <td>{s.franja}</td>
                    <td>{s.direccion}</td>
                    <td>{s.telefono}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>{new Date(s.updatedAt).toLocaleString('es-CO')}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleShowDetail(s.id)}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && selectedRecarga && (
        <div
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '600px',
              margin: '2rem auto',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}
            >
              <h2>Solicitud {selectedRecarga.id}</h2>
              <button onClick={closeModal} className="btn btn-ghost">
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3>Información General</h3>
              <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
                <p><strong>ID:</strong> {selectedRecarga.id}</p>
                <p><strong>Correo:</strong> {selectedRecarga.userEmail}</p>
                <p><strong>Tipo de Extintor:</strong> {selectedRecarga.tipo}</p>
                <p><strong>Estado del Extintor:</strong> {selectedRecarga.estadoExtintor}</p>
                <p><strong>Fecha Preferida:</strong> {selectedRecarga.fecha}</p>
                <p><strong>Franja Horaria:</strong> {selectedRecarga.franja}</p>
                <p><strong>Dirección:</strong> {selectedRecarga.direccion}</p>
                <p><strong>Teléfono:</strong> {selectedRecarga.telefono}</p>
                {selectedRecarga.observaciones && (
                  <p><strong>Observaciones:</strong> {selectedRecarga.observaciones}</p>
                )}
                <p>
                  <strong>Estado Actual:</strong>{' '}
                  <span className={`badge ${STATUS_COLORS[selectedRecarga.status]}`}>
                    {selectedRecarga.status}
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h3>Historial de Estados</h3>
              <div style={{ marginTop: '1rem' }}>
                {selectedRecarga.timeline.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: index < selectedRecarga.timeline.length - 1 
                        ? '1px solid #ecf0f1' 
                        : 'none'
                    }}
                  >
                    <div style={{ flexShrink: 0 }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#e74c3c',
                          marginTop: '0.25rem'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>
                        <span className={`badge ${STATUS_COLORS[entry.status]}`}>
                          {entry.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#7f8c8d',
                          marginTop: '0.25rem'
                        }}
                      >
                        {new Date(entry.ts).toLocaleString('es-CO')}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#95a5a6' }}>
                        Por: {entry.by}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}