import { useState, useEffect } from 'react'
import Header from '../components/common/Header'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatCOP } from '../utils/helpers'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  
  const { addToCart } = useCart()
  const { isAdmin } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, selectedCategory, products])

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/productos/list'),
        api.get('/categorias/list')
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
      setFilteredProducts(productsRes.data)
    } catch (error) {
      showAlert('Error al cargar productos', 'error')
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?.id == selectedCategory)
    }

    setFilteredProducts(filtered)
  }

  const handleAddToCart = (product) => {
    if (product.stock <= 0) return
    
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price
    })
    showAlert(`${product.name} agregado al carrito`, 'success')
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      await api.delete(`/productos/${productId}`)
      showAlert('Producto eliminado exitosamente', 'success')
      loadData()
    } catch (error) {
      showAlert('Error al eliminar producto', 'error')
    }
  }

  const showAlert = (message, type) => {
    setAlert({ message, type })
    setTimeout(() => setAlert(null), 5000)
  }

  return (
    <>
      <Header />
      <main className="container">
        <h1>Catálogo de Productos</h1>

        {alert && (
          <div className={`alert ${alert.type}`} role="alert">
            {alert.message}
          </div>
        )}

        <div className="toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '3rem' }}>Cargando productos...</p>
        ) : filteredProducts.length === 0 ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#7f8c8d', marginTop: '3rem' }}>
            No se encontraron productos
          </p>
        ) : (
          <div className="grid">
            {filteredProducts.map(product => {
              const categoryName = product.category?.name || 'Sin categoría'
              const stockBadge = product.stock > 0 ? (
                <span className="badge badge-success">{product.stock} disponibles</span>
              ) : (
                <span className="badge badge-danger">Agotado</span>
              )

              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">🧯</div>
                  <div className="product-body">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="product-price">{formatCOP(product.price)}</div>
                    <div className="product-info">
                      {stockBadge}
                      <br /><small>{categoryName}</small>
                    </div>
                    <div className="product-actions">
                      <button
                        className="btn btn-primary btn-small"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0}
                      >
                        Agregar
                      </button>
                      {isAdmin && (
                        <button
                          className="btn btn-danger btn-small"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}