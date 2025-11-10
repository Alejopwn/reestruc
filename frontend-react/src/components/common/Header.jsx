import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const { getCartCount } = useCart()

  return (
    <header>
      <nav>
        <Link to="/" className="logo">
          🔥 FireX Hub
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/catalogo">Catálogo</Link></li>
          <li><Link to="/recarga">Recarga</Link></li>
          <li><Link to="/solicitudes">Mis Solicitudes</Link></li>
          <li>
            <Link to="/carrito">
              Carrito (<span id="cart-count">{getCartCount()}</span>)
            </Link>
          </li>
          {isAdmin && (
            <li><Link to="/admin">Admin</Link></li>
          )}
          <li>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
              Cerrar Sesión
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}