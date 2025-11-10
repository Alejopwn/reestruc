import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/common/Header'
import api from '../services/api'
import { formatCOP } from '../utils/helpers'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get('/productos/list')
      setFeaturedProducts(response.data.slice(0, 3))
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="hero">
          <h1>Bienvenido a FireX Hub</h1>
          <p>Tu solución integral para extintores y seguridad contra incendios</p>
          <div className="hero-actions">
            <Link to="/catalogo" className="btn btn-primary">Ver Catálogo</Link>
            <Link to="/recarga" className="btn btn-secondary">Solicitar Recarga</Link>
          </div>
        </div>

        <section>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>¿Por qué elegirnos?</h2>
          <div className="grid">
            <div className="card">
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🛡️</div>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Calidad Garantizada</h3>
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                Productos certificados y de las mejores marcas del mercado
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>🚚</div>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Entrega Rápida</h3>
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                Envíos a toda Colombia en tiempo récord
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '1rem' }}>💼</div>
              <h3 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Servicio Profesional</h3>
              <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
                Asesoría experta y soporte técnico especializado
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Productos Destacados</h2>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Cargando productos...</p>
          ) : (
            <>
              <div className="grid">
                {featuredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">🧯</div>
                    <div className="product-body">
                      <h3 className="product-title">{product.name}</h3>
                      <div className="product-price">{formatCOP(product.price)}</div>
                      <div className="product-info">
                        Stock: {product.stock > 0 ? (
                          <span className="badge badge-success">{product.stock} disponibles</span>
                        ) : (
                          <span className="badge badge-danger">Agotado</span>
                        )}
                      </div>
                      <Link to="/catalogo" className="btn btn-primary btn-small" style={{ width: '100%' }}>
                        Ver en Catálogo
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link to="/catalogo" className="btn btn-primary">Ver Todos los Productos</Link>
              </div>
            </>
          )}
        </section>
      </main>
    </>
  )
}