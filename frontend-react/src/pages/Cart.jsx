import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import { useCart } from '../contexts/CartContext'
import { formatCOP } from '../utils/helpers'

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    const total = getCartTotal()
    alert(`¡Compra simulada!\n\nTotal: ${formatCOP(total)}\n\nGracias por tu compra en FireX Hub.`)
    clearCart()
    navigate('/')
  }

  const handleChangeQty = (productId, newQty) => {
    if (newQty < 1) return
    updateQuantity(productId, newQty)
  }

  const handleRemove = (productId) => {
    if (window.confirm('¿Eliminar este producto del carrito?')) {
      removeFromCart(productId)
    }
  }

  const handleEmptyCart = () => {
    if (window.confirm('¿Vaciar todo el carrito?')) {
      clearCart()
    }
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="container">
          <h1>Mi Carrito de Compras</h1>
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
            <h2>Tu carrito está vacío</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '2rem' }}>
              Agrega productos desde nuestro catálogo
            </p>
            <a href="/catalogo" className="btn btn-primary">Ir al Catálogo</a>
          </div>
        </main>
      </>
    )
  }

  const total = getCartTotal()

  return (
    <>
      <Header />
      <main className="container">
        <h1>Mi Carrito de Compras</h1>

        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{formatCOP(item.price)}</td>
                  <td>
                    <button
                      className="btn btn-small"
                      onClick={() => handleChangeQty(item.id, item.qty - 1)}
                    >
                      −
                    </button>
                    <span style={{ margin: '0 1rem' }}>{item.qty}</span>
                    <button
                      className="btn btn-small"
                      onClick={() => handleChangeQty(item.id, item.qty + 1)}
                    >
                      +
                    </button>
                  </td>
                  <td><strong>{formatCOP(item.price * item.qty)}</strong></td>
                  <td>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleRemove(item.id)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}>
                  <strong>Total:</strong>
                </td>
                <td colSpan="2">
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                    {formatCOP(total)}
                  </strong>
                </td>
              </tr>
            </tfoot>
          </table>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-danger" onClick={handleEmptyCart}>
              Vaciar Carrito
            </button>
            <button className="btn btn-success" onClick={handleCheckout}>
              Finalizar Compra
            </button>
          </div>
        </div>
      </main>
    </>
  )
}