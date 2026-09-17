import { useState } from 'react';
import type { MenuItem, Order, User } from '../types';
import { formatRupiah } from '../data';

type AdminView = 'dashboard' | 'orders' | 'menu';

interface AdminAppProps {
  user: User;
  menuItems: MenuItem[];
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onUpdateMenuItem: (item: MenuItem) => void;
  onAddMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  onLogout: () => void;
}

const statusFlow: Record<string, Order['status']> = {
  menunggu: 'diproses',
  diproses: 'siap_diambil',
  siap_diambil: 'selesai',
};

const statusConfig: Record<string, { label: string; color: string; bg: string; next?: string }> = {
  menunggu:     { label: 'Menunggu',     color: '#92400E', bg: '#FEF3C7', next: 'Proses' },
  diproses:     { label: 'Diproses',     color: '#1D4ED8', bg: '#DBEAFE', next: 'Siap Diambil' },
  siap_diambil: { label: 'Siap Diambil', color: '#15803D', bg: '#DCFCE7', next: 'Selesai' },
  selesai:      { label: 'Selesai',      color: '#6B7280', bg: '#F3F4F6' },
};

const emptyForm = {
  name: '', category: 'Makanan Berat' as MenuItem['category'],
  price: '', stock: '', description: '', emoji: '🍽️', image: '',
};

export default function AdminApp({ user, menuItems, orders, onUpdateOrderStatus, onUpdateMenuItem, onAddMenuItem, onLogout }: AdminAppProps) {
  const [view, setView] = useState<AdminView>('dashboard');
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalRevenue = orders.filter(o => o.paid).reduce((sum, o) => sum + o.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'selesai').length;
  const todayOrders = orders.length;

  const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMenuItem({
      name: addForm.name,
      category: addForm.category,
      price: Number(addForm.price),
      stock: Number(addForm.stock),
      description: addForm.description,
      emoji: addForm.emoji,
      image: addForm.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format`,
    });
    setAddForm(emptyForm);
    setShowAddForm(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    onUpdateMenuItem(editItem);
    setEditItem(null);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <div>
              <span className="font-black text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>SIKANTIN</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>Admin</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {(['dashboard', 'orders', 'menu'] as AdminView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: view === v ? 'var(--primary)' : 'transparent',
                  color: view === v ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {v === 'dashboard' && '📊 Dasbor'}
                {v === 'orders' && '📋 Pesanan'}
                {v === 'menu' && '🍱 Kelola Menu'}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold hidden sm:block">{user.name}</span>
            <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg font-semibold hover:opacity-80"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Keluar</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {/* ─── DASHBOARD ─── */}
        {view === 'dashboard' && (
          <div>
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📊 Ringkasan Hari Ini</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Pesanan', value: String(todayOrders), icon: '🧾', color: 'var(--primary)', bg: 'var(--secondary)' },
                { label: 'Pesanan Aktif', value: String(activeOrders), icon: '🔥', color: '#1D4ED8', bg: '#DBEAFE' },
                { label: 'Total Pendapatan', value: formatRupiah(totalRevenue), icon: '💰', color: '#15803D', bg: '#DCFCE7' },
                { label: 'Menu Tersedia', value: String(menuItems.filter(m => m.stock > 0).length), icon: '✅', color: '#7C3AED', bg: '#EDE9FE' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl p-4" style={{ background: stat.bg }}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <p className="text-2xl font-black leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: stat.color }}>
                    {stat.value}
                  </p>
                  <p className="text-xs font-semibold mt-1" style={{ color: stat.color, opacity: 0.8 }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <h3 className="font-black mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Pesanan Terbaru</h3>
            <div className="space-y-3">
              {orders.filter(o => o.status !== 'selesai').slice(0, 5).map(order => {
                const st = statusConfig[order.status];
                const nextStatus = statusFlow[order.status];
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
                      style={{ background: st.bg, color: st.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                      #{order.queueNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{order.userName}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {order.items.map(i => `${i.menuItem.name} ×${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      {nextStatus && (
                        <button onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                          className="px-2 py-1 rounded-lg text-xs font-bold transition-all hover:opacity-90"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                          → {st.next}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {orders.filter(o => o.status !== 'selesai').length === 0 && (
                <div className="text-center py-8 rounded-2xl" style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="font-semibold text-sm">Tidak ada pesanan aktif</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── ORDERS ─── */}
        {view === 'orders' && (
          <div>
            <h2 className="text-xl font-black mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📋 Kelola Pesanan</h2>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'menunggu', label: '⏳ Menunggu' },
                { key: 'diproses', label: '🔄 Diproses' },
                { key: 'siap_diambil', label: '✅ Siap Diambil' },
                { key: 'selesai', label: '✓ Selesai' },
              ].map(f => (
                <button key={f.key} onClick={() => setStatusFilter(f.key)}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: statusFilter === f.key ? 'var(--primary)' : 'var(--card)',
                    color: statusFilter === f.key ? 'var(--primary-foreground)' : 'var(--foreground)',
                    border: `2px solid ${statusFilter === f.key ? 'var(--primary)' : 'var(--border)'}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {[...filteredOrders].reverse().map(order => {
                const st = statusConfig[order.status];
                const nextStatus = statusFlow[order.status];
                return (
                  <div key={order.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                          style={{ background: st.bg, color: st.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          #{order.queueNumber}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{order.userName}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm" style={{ color: 'var(--primary)' }}>{formatRupiah(order.total)}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#DCFCE7', color: '#15803D' }}>✓ Lunas</span>
                      </div>
                    </div>

                    <div className="mb-3 space-y-1">
                      {order.items.map(item => (
                        <div key={item.menuItem.id} className="flex justify-between text-xs">
                          <span style={{ color: 'var(--muted-foreground)' }}>{item.menuItem.emoji} {item.menuItem.name} × {item.quantity}</span>
                          <span className="font-semibold">{formatRupiah(item.menuItem.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      {nextStatus && (
                        <button onClick={() => onUpdateOrderStatus(order.id, nextStatus)}
                          className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          → {st.next}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>
                  <p className="text-3xl mb-2">📋</p>
                  <p className="font-semibold">Tidak ada pesanan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── MENU MANAGEMENT ─── */}
        {view === 'menu' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🍱 Kelola Menu</h2>
              <button onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                + Tambah Menu
              </button>
            </div>

            <div className="space-y-3">
              {menuItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.category}</p>
                    <p className="text-sm font-black" style={{ color: 'var(--primary)' }}>{formatRupiah(item.price)}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-black text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: item.stock === 0 ? '#EF4444' : item.stock <= 5 ? '#F59E0B' : 'var(--accent)' }}>
                      {item.stock}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>stok</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => onUpdateMenuItem({ ...item, stock: Math.max(0, item.stock - 1) })}
                      className="w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center"
                      style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>−</button>
                    <button onClick={() => onUpdateMenuItem({ ...item, stock: item.stock + 1 })}
                      className="w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center"
                      style={{ background: 'var(--accent)', color: 'var(--accent-foreground)' }}>+</button>
                    <button onClick={() => setEditItem(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold"
                      style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit menu modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--card)' }}>
            <h3 className="font-black mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Edit Menu</h3>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama</label>
                <input value={editItem.name} onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Harga (Rp)</label>
                  <input type="number" value={editItem.price} onChange={e => setEditItem({ ...editItem, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stok</label>
                  <input type="number" value={editItem.stock} onChange={e => setEditItem({ ...editItem, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Deskripsi</label>
                <textarea value={editItem.description} onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                  rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add menu modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6 overflow-y-auto max-h-[90vh]" style={{ background: 'var(--card)' }}>
            <h3 className="font-black mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Tambah Menu Baru</h3>
            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Nama Menu</label>
                <input required value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Kategori</label>
                <select value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value as MenuItem['category'] }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ border: '2px solid var(--border)', background: 'var(--background)' }}>
                  <option>Makanan Berat</option>
                  <option>Minuman</option>
                  <option>Snack & Jajanan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Harga (Rp)</label>
                  <input required type="number" min={0} value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stok Awal</label>
                  <input required type="number" min={0} value={addForm.stock} onChange={e => setAddForm(f => ({ ...f, stock: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Deskripsi</label>
                <textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                  style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Emoji</label>
                  <input value={addForm.emoji} onChange={e => setAddForm(f => ({ ...f, emoji: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ border: '2px solid var(--border)', background: 'var(--background)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Batal</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Tambah</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
