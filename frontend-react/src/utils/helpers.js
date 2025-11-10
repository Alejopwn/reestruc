// Format currency to Colombian Pesos
export function formatCOP(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

// Get today's date in YYYY-MM-DD format
export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

// Recarga status colors
export const STATUS_COLORS = {
  'PENDIENTE': 'badge-warning',
  'RECOGIDO': 'badge-info',
  'EN_RECARGA': 'badge-primary',
  'LISTO': 'badge-success',
  'ENTREGADO': 'badge-success',
  'FINALIZADO': 'badge-secondary'
}

// Recarga status order
export const STATUS_ORDER = [
  'PENDIENTE',
  'RECOGIDO',
  'EN_RECARGA',
  'LISTO',
  'ENTREGADO',
  'FINALIZADO'
]

// Toast notification
export function showToast(message, type = 'info') {
  // This can be enhanced with a toast library like react-hot-toast
  console.log(`[${type.toUpperCase()}]`, message)
}

// LocalStorage helpers for recargas
const STORAGE_KEYS = {
  RECARGAS: 'fx:recargas'
}

export function getRecargas() {
  const data = localStorage.getItem(STORAGE_KEYS.RECARGAS)
  return data ? JSON.parse(data) : []
}

export function setRecargas(recargas) {
  localStorage.setItem(STORAGE_KEYS.RECARGAS, JSON.stringify(recargas))
}

export function createRecarga(data) {
  const recargas = getRecargas()
  const timestamp = Date.now()
  const id = `SR-${timestamp}`

  const newRecarga = {
    id,
    userEmail: data.userEmail,
    userId: data.userId || null,
    tipo: data.tipo,
    estadoExtintor: data.estadoExtintor,
    fecha: data.fecha,
    franja: data.franja,
    direccion: data.direccion,
    telefono: data.telefono,
    observaciones: data.observaciones || '',
    status: 'PENDIENTE',
    timeline: [
      {
        ts: new Date().toISOString(),
        status: 'PENDIENTE',
        by: data.userEmail
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  recargas.push(newRecarga)
  setRecargas(recargas)
  return id
}

export function getRecargasByUser(email) {
  const recargas = getRecargas()
  return recargas.filter(r => r.userEmail === email)
}

export function getAllRecargas() {
  return getRecargas()
}

export function getRecargaById(id) {
  const recargas = getRecargas()
  return recargas.find(r => r.id === id)
}

export function updateRecargaStatus(id, newStatus, by) {
  const recargas = getRecargas()
  const recarga = recargas.find(r => r.id === id)

  if (recarga) {
    recarga.status = newStatus
    recarga.updatedAt = new Date().toISOString()
    recarga.timeline.push({
      ts: new Date().toISOString(),
      status: newStatus,
      by: by || 'admin'
    })
    setRecargas(recargas)
    return true
  }
  return false
}

export function deleteRecarga(id) {
  const recargas = getRecargas()
  const filtered = recargas.filter(r => r.id !== id)
  setRecargas(filtered)
  return true
}