import { useState } from 'react';
import type { User, MenuItem, Order, CartItem } from './types';
import { initialMenuItems } from './data';
import AuthPage from './pages/AuthPage';
import StudentApp from './pages/StudentApp';
import AdminApp from './pages/AdminApp';

let queueCounter = 1;

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [orders, setOrders] = useState<Order[]>([]);
  const [userBalance, setUserBalance] = useState<number>(150000);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.balance !== undefined) setUserBalance(user.balance);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserBalance(150000);
  };

  const handlePlaceOrder = (items: CartItem[], total: number): Order => {
    const order: Order = {
      id: `order_${Date.now()}`,
      userId: currentUser!.id,
      userName: currentUser!.name,
      items,
      total,
      queueNumber: queueCounter++,
      status: 'menunggu',
      createdAt: new Date(),
      paid: true,
    };
    // Deduct stock
    setMenuItems(prev =>
      prev.map(m => {
        const cartEntry = items.find(i => i.menuItem.id === m.id);
        if (!cartEntry) return m;
        return { ...m, stock: Math.max(0, m.stock - cartEntry.quantity) };
      })
    );
    setOrders(prev => [...prev, order]);
    return order;
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleUpdateMenuItem = (updated: MenuItem) => {
    setMenuItems(prev => prev.map(m => m.id === updated.id ? updated : m));
  };

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `m_${Date.now()}` };
    setMenuItems(prev => [...prev, newItem]);
  };

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (currentUser.role === 'admin') {
    return (
      <AdminApp
        user={currentUser}
        menuItems={menuItems}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdateMenuItem={handleUpdateMenuItem}
        onAddMenuItem={handleAddMenuItem}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <StudentApp
      user={currentUser}
      menuItems={menuItems}
      orders={orders}
      onPlaceOrder={handlePlaceOrder}
      onLogout={handleLogout}
      balance={userBalance}
      onUpdateBalance={setUserBalance}
    />
  );
}
