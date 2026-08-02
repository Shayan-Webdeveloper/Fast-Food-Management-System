export const DEMO_USERS = [
  {
    id: '1',
    name: 'Alex Admin',
    email: 'admin@foodhub.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'AA',
    restaurant: 'FoodHub Downtown',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Maria Manager',
    email: 'manager@foodhub.com',
    password: 'manager123',
    role: 'manager',
    avatar: 'MM',
    restaurant: 'FoodHub Downtown',
    joinedAt: '2024-03-20',
  },
  {
    id: '3',
    name: 'John Customer',
    email: 'customer@foodhub.com',
    password: 'customer123',
    role: 'customer',
    avatar: 'JC',
    restaurant: null,
    joinedAt: '2024-06-10',
  },
]

export const INITIAL_MENU = [
  { id: 'm1', name: 'Classic Burger', category: 'Burgers', price: 8.99, description: 'Juicy beef patty with lettuce, tomato, and special sauce', image: '🍔', available: true, popular: true },
  { id: 'm2', name: 'Crispy Chicken Wrap', category: 'Wraps', price: 7.49, description: 'Crispy chicken strips with ranch and fresh veggies', image: '🌯', available: true, popular: true },
  { id: 'm3', name: 'Loaded Fries', category: 'Sides', price: 4.99, description: 'Golden fries topped with cheese, bacon, and jalapeños', image: '🍟', available: true, popular: false },
  { id: 'm4', name: 'Margherita Pizza Slice', category: 'Pizza', price: 5.99, description: 'Fresh mozzarella, basil, and tomato sauce on thin crust', image: '🍕', available: true, popular: true },
  { id: 'm5', name: 'Chocolate Milkshake', category: 'Drinks', price: 3.99, description: 'Rich and creamy chocolate shake with whipped cream', image: '🥤', available: true, popular: false },
  { id: 'm6', name: 'Spicy Wings (6pc)', category: 'Appetizers', price: 9.99, description: 'Crispy wings tossed in our signature hot sauce', image: '🍗', available: true, popular: true },
  { id: 'm7', name: 'Veggie Deluxe Burger', category: 'Burgers', price: 9.49, description: 'Plant-based patty with avocado and caramelized onions', image: '🥬', available: true, popular: false },
  { id: 'm8', name: 'Iced Latte', category: 'Drinks', price: 4.49, description: 'Smooth espresso over ice with your choice of milk', image: '☕', available: false, popular: false },
]

export const INITIAL_ORDERS = [
  { id: 'ORD-1001', customerId: '3', customerName: 'John Customer', items: [{ id: 'm1', name: 'Classic Burger', qty: 2, price: 8.99 }, { id: 'm3', name: 'Loaded Fries', qty: 1, price: 4.99 }], total: 22.97, status: 'delivered', createdAt: '2026-07-25T12:30:00', paymentMethod: 'card' },
  { id: 'ORD-1002', customerId: '3', customerName: 'John Customer', items: [{ id: 'm4', name: 'Margherita Pizza Slice', qty: 3, price: 5.99 }], total: 17.97, status: 'preparing', createdAt: '2026-07-26T09:15:00', paymentMethod: 'cash' },
  { id: 'ORD-1003', customerId: '4', customerName: 'Sarah Lee', items: [{ id: 'm6', name: 'Spicy Wings (6pc)', qty: 1, price: 9.99 }, { id: 'm5', name: 'Chocolate Milkshake', qty: 2, price: 3.99 }], total: 17.97, status: 'pending', createdAt: '2026-07-26T11:00:00', paymentMethod: 'card' },
  { id: 'ORD-1004', customerId: '5', customerName: 'Mike Chen', items: [{ id: 'm2', name: 'Crispy Chicken Wrap', qty: 2, price: 7.49 }], total: 14.98, status: 'ready', createdAt: '2026-07-26T10:45:00', paymentMethod: 'card' },
  { id: 'ORD-1005', customerId: '6', customerName: 'Emma Wilson', items: [{ id: 'm1', name: 'Classic Burger', qty: 1, price: 8.99 }, { id: 'm5', name: 'Chocolate Milkshake', qty: 1, price: 3.99 }], total: 12.98, status: 'cancelled', createdAt: '2026-07-24T18:20:00', paymentMethod: 'card' },
]

export const REVENUE_DATA = [
  { day: 'Mon', revenue: 1240, orders: 48 },
  { day: 'Tue', revenue: 980, orders: 38 },
  { day: 'Wed', revenue: 1560, orders: 62 },
  { day: 'Thu', revenue: 1320, orders: 51 },
  { day: 'Fri', revenue: 2100, orders: 84 },
  { day: 'Sat', revenue: 2450, orders: 98 },
  { day: 'Sun', revenue: 1890, orders: 72 },
]

export const CATEGORY_SALES = [
  { name: 'Burgers', value: 35, color: '#f97316' },
  { name: 'Pizza', value: 22, color: '#ef4444' },
  { name: 'Wraps', value: 18, color: '#eab308' },
  { name: 'Drinks', value: 15, color: '#3b82f6' },
  { name: 'Sides', value: 10, color: '#22c55e' },
]

export const CUSTOMERS = [
  { id: '3', name: 'John Customer', email: 'customer@foodhub.com', orders: 12, spent: 156.40, lastOrder: '2026-07-26', status: 'active' },
  { id: '4', name: 'Sarah Lee', email: 'sarah@email.com', orders: 8, spent: 98.20, lastOrder: '2026-07-26', status: 'active' },
  { id: '5', name: 'Mike Chen', email: 'mike@email.com', orders: 15, spent: 210.50, lastOrder: '2026-07-26', status: 'active' },
  { id: '6', name: 'Emma Wilson', email: 'emma@email.com', orders: 3, spent: 42.00, lastOrder: '2026-07-24', status: 'inactive' },
  { id: '7', name: 'David Park', email: 'david@email.com', orders: 22, spent: 312.80, lastOrder: '2026-07-25', status: 'active' },
]

export const NOTIFICATIONS = [
  { id: 'n1', title: 'New order received', message: 'Order ORD-1003 from Sarah Lee', time: '2 min ago', read: false, type: 'order' },
  { id: 'n2', title: 'Low stock alert', message: 'Iced Latte is out of stock', time: '1 hour ago', read: false, type: 'alert' },
  { id: 'n3', title: 'Weekly report ready', message: 'Your analytics report for July is available', time: '3 hours ago', read: true, type: 'info' },
  { id: 'n4', title: 'Order delivered', message: 'Order ORD-1001 was delivered successfully', time: 'Yesterday', read: true, type: 'order' },
]

export const ORDER_STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
}
