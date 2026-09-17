export interface MenuItem {
  id: string;
  name: string;
  category: 'Makanan Berat' | 'Minuman' | 'Snack & Jajanan';
  price: number;
  stock: number;
  image: string;
  description: string;
  emoji: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export type OrderStatus = 'menunggu' | 'diproses' | 'siap_diambil' | 'selesai';

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: CartItem[];
  total: number;
  queueNumber: number;
  status: OrderStatus;
  createdAt: Date;
  paid: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  balance: number;
  nim?: string;
}
