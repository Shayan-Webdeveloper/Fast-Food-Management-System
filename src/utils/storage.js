const STORAGE_KEYS = {
  users: 'foodhub_users',
  session: 'foodhub_session',
  menu: 'foodhub_menu',
  orders: 'foodhub_orders',
  notifications: 'foodhub_notifications',
}

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setItem(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key) {
  localStorage.removeItem(key)
}

export { STORAGE_KEYS }
