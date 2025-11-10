import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('fx:cart')
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart))
      } catch (error) {
        console.error('Error parsing cart:', error)
        localStorage.removeItem('fx:cart')
      }
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('fx:cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      }
      
      return [...prevCart, { ...product, qty: 1 }]
    })
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, qty: newQty }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('fx:cart')
  }

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0)
  }

  const getCartCount = () => {
    return cart.reduce((sum, item) => sum + item.qty, 0)
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}