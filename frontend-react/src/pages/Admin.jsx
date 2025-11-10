import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import {
    getAllRecargas,
    getRecargaById,
    updateRecargaStatus,
    deleteRecarga,
    STATUS_COLORS,
    STATUS_ORDER,
    formatCOP
} from '../utils/helpers'

export default function Admin() {
    const { user, logout } = useAuth()

    // State
    const [activeSection, setActiveSection] = useState('dashboard')
    const [sidebarCollapsed, setSidebarCollapsed] = useState(
        localStorage.getItem('fx:admin:sidebarCollapsed') === 'true'
    )
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Data state
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [users, setUsers] = useState([])
    const [recargas, setRecargas] = useState([])

    // Loading state
    const [loading, setLoading] = useState(true)
    const [alert, setAlert] = useState(null)

    // Forms state
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: ''
    })
    const [categoryForm, setCategoryForm] = useState({ name: '' })

    // Modal state
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [selectedRecarga, setSelectedRecarga] = useState(null)
    const [newStatus, setNewStatus] = useState('')
    const [notifyChange, setNotifyChange] = useState(false)

    useEffect(() => {
        const section = window.location.hash.slice(1) ||
            localStorage.getItem('fx:admin:lastSection') ||
            'dashboard'
        setActiveSection(section)
        loadData()
    }, [])

    useEffect(() => {
        if (activeSection === 'usuarios' && users.length === 0) {
            loadUsers()
        }
    }, [activeSection])

    const loadData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/productos/list'),
                api.get('/categorias/list')
            ])
            setProducts(productsRes.data)
            setCategories(categoriesRes.data)
            setRecargas(getAllRecargas())
        } catch (error) {
            showAlert('Error al cargar datos', 'error')
        } finally {
            setLoading(false)
        }
    }

    const loadUsers = async () => {
        try {
            const response = await api.get('/api/users/all')
            setUsers(response.data)
        } catch (error) {
            showAlert('Error al cargar usuarios', 'error')
        }
    }

    const showAlert = (message, type = 'info') => {
        setAlert({ message, type })
        setTimeout(() => setAlert(null), 5000)
    }

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
        localStorage.setItem('fx:admin:sidebarCollapsed', !sidebarCollapsed)
    }

    const handleSectionChange = (section) => {
        setActiveSection(section)
        localStorage.setItem('fx:admin:lastSection', section)
        window.location.hash = section
        if (window.innerWidth < 1024) {
            setMobileMenuOpen(false)
        }
    }

    // Product handlers
    const handleProductSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/productos/', {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                stock: parseInt(productForm.stock),
                category: { id: parseInt(productForm.categoryId) }
            })
            showAlert('Producto agregado exitosamente', 'success')
            setProductForm({ name: '', description: '', price: '', stock: '', categoryId: '' })
            loadData()
        } catch (error) {
            showAlert('Error al agregar producto', 'error')
        }
    }

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('¿Eliminar este producto?')) return
        try {
            await api.delete(`/productos/${id}`)
            showAlert('Producto eliminado', 'success')
            loadData()
        } catch (error) {
            showAlert('Error al eliminar producto', 'error')
        }
    }

    // Category handlers
    const handleCategorySubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/categorias/', { name: categoryForm.name })
            showAlert('Categoría agregada exitosamente', 'success')
            setCategoryForm({ name: '' })
            loadData()
        } catch (error) {
            showAlert('Error al agregar categoría', 'error')
        }
    }

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('¿Eliminar esta categoría?')) return
        try {
            await api.delete(`/categorias/${id}`)
            showAlert('Categoría eliminada', 'success')
            loadData()
        } catch (error) {
            showAlert('Error al eliminar categoría', 'error')
        }
    }

    // User handlers
    const handleDeleteUser = async (id) => {
        if (id === user.id) {
            showAlert('No puedes eliminarte a ti mismo', 'error')
            return
        }
        if (!window.confirm('¿Eliminar este usuario?')) return
        try {
            await api.delete(`/api/users/delete/${id}`)
            showAlert('Usuario eliminado', 'success')
            loadUsers()
        } catch (error) {
            showAlert('Error al eliminar usuario', 'error')
        }
    }

    // Recarga handlers
    const handleOpenStatusModal = (recargaId) => {
        const recarga = getRecargaById(recargaId)
        setSelectedRecarga(recarga)
        setNewStatus(recarga.status)
        setShowStatusModal(true)
    }

    const handleUpdateStatus = () => {
        if (!selectedRecarga) return

        const currentIndex = STATUS_ORDER.indexOf(selectedRecarga.status)
        const newIndex = STATUS_ORDER.indexOf(newStatus)

        if (newIndex < currentIndex) {
            showAlert('No se puede retroceder el estado', 'error')
            return
        }

        updateRecargaStatus(selectedRecarga.id, newStatus, user.email)
        showAlert('Estado actualizado exitosamente', 'success')
        setShowStatusModal(false)
        setRecargas(getAllRecargas())
    }

    const handleDeleteRecarga = (id) => {
        if (!window.confirm(`¿Eliminar la solicitud ${id}?`)) return
        deleteRecarga(id)
        showAlert('Solicitud eliminada', 'success')
        setRecargas(getAllRecargas())
    }

    // KPIs calculation
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    const pendingRecargas = recargas.filter(r => r.status === 'PENDIENTE').length

    return (
        <>
            {/* Header */}
            <header>
                <nav>
                    <Link to="/admin" className="logo">🔥 FireX Hub Admin</Link>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <ul className="nav-links">
                        <li><Link to="/">Volver al Inicio</Link></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Cerrar Sesión</a></li>
                    </ul>
                </nav>
            </header>

            <div className="admin-layout">
                {/* Sidebar Overlay */}
                <div
                    className={`sidebar-overlay ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Sidebar */}
                <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <svg className="sidebar-brand-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                            </svg>
                            <span className="sidebar-brand-text">FireX Admin</span>
                        </div>
                        <button className="sidebar-collapse-btn" onClick={toggleSidebar}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                    </div>

                    <nav className="sidebar-nav">
                        <ul>
                            <li>
                                <a
                                    href="#dashboard"
                                    className={`sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); handleSectionChange('dashboard'); }}
                                >
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="3" width="7" height="7"></rect>
                                        <rect x="14" y="14" width="7" height="7"></rect>
                                        <rect x="3" y="14" width="7" height="7"></rect>
                                    </svg>
                                    <span className="sidebar-label">Dashboard</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#productos"
                                    className={`sidebar-item ${activeSection === 'productos' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); handleSectionChange('productos'); }}
                                >
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    </svg>
                                    <span className="sidebar-label">Productos</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#categorias"
                                    className={`sidebar-item ${activeSection === 'categorias' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); handleSectionChange('categorias'); }}
                                >
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    </svg>
                                    <span className="sidebar-label">Categorías</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#usuarios"
                                    className={`sidebar-item ${activeSection === 'usuarios' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); handleSectionChange('usuarios'); }}
                                >
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                    </svg>
                                    <span className="sidebar-label">Usuarios</span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#recargas"
                                    className={`sidebar-item ${activeSection === 'recargas' ? 'active' : ''}`}
                                    onClick={(e) => { e.preventDefault(); handleSectionChange('recargas'); }}
                                >
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 4 23 10 17 10"></polyline>
                                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                    </svg>
                                    <span className="sidebar-label">Recargas</span>
                                    {pendingRecargas > 0 && (
                                        <span className="sidebar-badge">{pendingRecargas}</span>
                                    )}
                                </a>
                            </li>
                        </ul>
                    </nav>

                    <div className="sidebar-footer">
                        <ul>
                            <li>
                                <Link to="/" className="sidebar-item">
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                    </svg>
                                    <span className="sidebar-label">Volver al Inicio</span>
                                </Link>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="sidebar-item">
                                    <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                        <polyline points="16 17 21 12 16 7"></polyline>
                                        <line x1="21" y1="12" x2="9" y2="12"></line>
                                    </svg>
                                    <span className="sidebar-label">Cerrar Sesión</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="admin-content">
                    {alert && (
                        <div className={`alert ${alert.type}`} role="alert">
                            {alert.message}
                        </div>
                    )}

                    {/* Dashboard */}
                    {activeSection === 'dashboard' && (
                        <section className="admin-section active">
                            <h1>Dashboard</h1>
                            <div className="kpi-grid">
                                <div className="kpi-card">
                                    <div className="kpi-value">{products.length}</div>
                                    <div className="kpi-label">Productos</div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-value">{categories.length}</div>
                                    <div className="kpi-label">Categorías</div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-value">{recargas.length}</div>
                                    <div className="kpi-label">Recargas</div>
                                </div>
                                <div className="kpi-card">
                                    <div className="kpi-value">{totalStock}</div>
                                    <div className="kpi-label">Stock Total</div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Productos */}
                    {activeSection === 'productos' && (
                        <section className="admin-section active">
                            <div className="card">
                                <h2 className="card-header">Gestión de Productos</h2>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3>Agregar Nuevo Producto</h3>
                                    <form onSubmit={handleProductSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Nombre"
                                            value={productForm.name}
                                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descripción"
                                            value={productForm.description}
                                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Precio"
                                            value={productForm.price}
                                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock"
                                            value={productForm.stock}
                                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                            required
                                            min="0"
                                        />
                                        <select
                                            value={productForm.categoryId}
                                            onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                            required
                                        >
                                            <option value="">Categoría...</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <button type="submit" className="btn btn-success">Agregar Producto</button>
                                    </form>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Precio</th>
                                                <th>Stock</th>
                                                <th>Categoría</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.id}</td>
                                                    <td><strong>{p.name}</strong></td>
                                                    <td>{formatCOP(p.price)}</td>
                                                    <td>{p.stock}</td>
                                                    <td>{p.category?.name || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteProduct(p.id)}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Categorías */}
                    {activeSection === 'categorias' && (
                        <section className="admin-section active">
                            <div className="card">
                                <h2 className="card-header">Gestión de Categorías</h2>

                                <div style={{ marginBottom: '2rem' }}>
                                    <h3>Agregar Nueva Categoría</h3>
                                    <form onSubmit={handleCategorySubmit} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <input
                                            type="text"
                                            placeholder="Nombre de la categoría"
                                            value={categoryForm.name}
                                            onChange={(e) => setCategoryForm({ name: e.target.value })}
                                            required
                                            style={{ flex: 1 }}
                                        />
                                        <button type="submit" className="btn btn-success">Agregar Categoría</button>
                                    </form>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {categories.map(c => (
                                                <tr key={c.id}>
                                                    <td>{c.id}</td>
                                                    <td><strong>{c.name}</strong></td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteCategory(c.id)}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Usuarios */}
                    {activeSection === 'usuarios' && (
                        <section className="admin-section active">
                            <div className="card">
                                <h2 className="card-header">Gestión de Usuarios</h2>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Teléfono</th>
                                                <th>Dirección</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id}>
                                                    <td><strong>{u.id}</strong></td>
                                                    <td>{u.name || 'N/A'}</td>
                                                    <td>{u.email || 'N/A'}</td>
                                                    <td>
                                                        <span className={`badge badge-${u.role ? u.role.toLowerCase() : 'user'}`}>
                                                            {u.role || 'USER'}
                                                        </span>
                                                    </td>
                                                    <td>{u.phone || 'N/A'}</td>
                                                    <td>{u.address || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            disabled={u.id === user.id}
                                                            title={u.id === user.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                                                        >
                                                            🗑️ Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Recargas */}
                    {activeSection === 'recargas' && (
                        <section className="admin-section active">
                            <div className="card">
                                <h2 className="card-header">Gestión de Recargas</h2>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Correo</th>
                                                <th>Tipo</th>
                                                <th>Fecha</th>
                                                <th>Dirección</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recargas.map(r => (
                                                <tr key={r.id}>
                                                    <td><strong>{r.id}</strong></td>
                                                    <td>{r.userEmail}</td>
                                                    <td>{r.tipo}</td>
                                                    <td>{r.fecha}</td>
                                                    <td>{r.direccion}</td>
                                                    <td><span className={`badge ${STATUS_COLORS[r.status]}`}>{r.status}</span></td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary btn-small"
                                                            onClick={() => handleOpenStatusModal(r.id)}
                                                        >
                                                            Cambiar Estado
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-small"
                                                            onClick={() => handleDeleteRecarga(r.id)}
                                                            style={{ marginLeft: '0.5rem' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            </div>

            {/* Status Modal */}
            {showStatusModal && selectedRecarga && (
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
                        if (e.target === e.currentTarget) setShowStatusModal(false)
                    }}
                >
                    <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2>Cambiar Estado</h2>
                            <button onClick={() => setShowStatusModal(false)} className="btn btn-ghost">✕</button>
                        </div>

                        <div className="form-group">
                            <label htmlFor="new-status">Nuevo Estado</label>
                            <select
                                id="new-status"
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                {STATUS_ORDER.map((status, index) => {
                                    const currentIndex = STATUS_ORDER.indexOf(selectedRecarga.status)
                                    return (
                                        <option
                                            key={status}
                                            value={status}
                                            disabled={index < currentIndex}
                                        >
                                            {status}
                                        </option>
                                    )
                                })}
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={notifyChange}
                                    onChange={(e) => setNotifyChange(e.target.checked)}
                                />
                                <span>Enviar notificación al cliente</span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleUpdateStatus}
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                            >
                                Actualizar Estado
                            </button>
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}