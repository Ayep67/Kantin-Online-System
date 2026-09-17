import { useState } from 'react';
import type { MenuItem, CartItem, Order, User } from '../types';
import { formatRupiah } from '../data';

type StudentView = 'menu' | 'cart' | 'orders';

interface StudentAppProps {
  user: User;
  menuItems: MenuItem[];
  orders: Order[];
  onPlaceOrder: (items: CartItem[], total: number) => Order;
  onLogout: () => void;
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
}

const categories = ['Semua', 'Makanan Berat', 'Minuman', 'Snack & Jajanan'];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  menunggu:     { label: 'Menunggu',     color: '#92400E', bg: '#FEF3C7' },
  diproses:     { label: 'Diproses',     color: '#1D4ED8', bg: '#DBEAFE' },
  siap_diambil: { label: 'Siap Diambil', color: '#15803D', bg: '#DCFCE7' },
  selesai:      { label: 'Selesai',      color: '#6B7280', bg: '#F3F4F6' },
};

export default function StudentApp({ user, menuItems, orders, onPlaceOrder, onLogout, balance, onUpdateBalance }: StudentAppProps) {
  const [view, setView] = useState<StudentView>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState(false);

  const myOrders = orders.filter(o => o.userId === user.id);
  const cartTotal = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'Semua' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    if (item.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(c => c.menuItem.id === item.id);
      if (existing) return prev.map(c => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => {
      const updated = prev.map(c => c.menuItem.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c);
      return updated.filter(c => c.quantity > 0);
    });
  };

  const getCartQty = (id: string) => cart.find(c => c.menuItem.id === id)?.quantity ?? 0;

  const handleCheckout = () => {
    if (balance < cartTotal) { alert('Saldo tidak cukup!'); return; }
    const order = onPlaceOrder(cart, cartTotal);
    onUpdateBalance(balance - cartTotal);
    setLastOrder(order);
    setCart([]);
    setPaymentModal(false);
    setView('orders');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Top nav */}
      <header className="sticky top-0 z-40 shadow-sm" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍽️</span>
            <span className="font-black text-lg" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>SIKANTIN</span>
          </div>
          <nav className="flex items-center gap-1">
            {(['menu', 'cart', 'orders'] as StudentView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="relative px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: view === v ? 'var(--primary)' : 'transparent',
                  color: view === v ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                }}
              >
                {v === 'menu' && '🍱 Menu'}
                {v === 'cart' && (
                  <>
                    🛒 Keranjang
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                        style={{ background: '#EF4444', color: '#fff' }}>{cartCount}</span>
                    )}
                  </>
                )}
                {v === 'orders' && '📋 Pesanan'}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold">{user.name}</span>
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{formatRupiah(balance)}</span>
            </div>
            <button onClick={onLogout} className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {/* ─── MENU VIEW ─── */}
        {view === 'menu' && (
          <div>
            {/* Hero banner */}
            <div className="rounded-2xl p-6 mb-6 flex items-center justify-between overflow-hidden relative"
              style={{ background: 'var(--primary)' }}>
              <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full opacity-20" style={{ background: '#fff' }} />
              <div className="absolute right-20 bottom-0 w-24 h-24 rotate-12 opacity-10" style={{ background: '#fff' }} />
              <div className="relative z-10">
                <p className="text-orange-100 text-sm font-semibold mb-1">Hai, {user.name.split(' ')[0]}! 👋</p>
                <h2 className="text-2xl font-black text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Mau makan apa<br />hari ini?
                </h2>
              </div>
              <div className="relative z-10 text-right hidden sm:block">
                <p className="text-orange-100 text-xs">Saldo kamu</p>
                <p className="text-white text-lg font-black">{formatRupiah(balance)}</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="🔍  Cari menu..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--card)', border: '2px solid var(--border)', fontFamily: 'Nunito, sans-serif' }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
                  style={{
                    background: activeCategory === cat ? 'var(--primary)' : 'var(--card)',
                    color: activeCategory === cat ? 'var(--primary-foreground)' : 'var(--foreground)',
                    border: `2px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(item => {
                const qty = getCartQty(item.id);
                const isOut = item.stock === 0;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden transition-all hover:shadow-md"
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      opacity: isOut ? 0.6 : 1,
                    }}
                  >
                    <div className="relative h-36 bg-orange-50 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {isOut && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                          <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: '#EF4444' }}>Habis</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(255,255,255,0.92)', color: 'var(--foreground)' }}>
                        {item.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.name}</h3>
                      <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--muted-foreground)' }}>{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm" style={{ color: 'var(--primary)' }}>{formatRupiah(item.price)}</span>
                        {!isOut && (
                          qty === 0 ? (
                            <button
                              onClick={() => addToCart(item)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
                            >
                              + Tambah
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center"
                                style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>−</button>
                              <span className="font-bold text-sm w-4 text-center">{qty}</span>
                              <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg font-bold text-sm flex items-center justify-center"
                                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>+</button>
                            </div>
                          )
                        )}
                      </div>
                      <p className="text-xs mt-1.5" style={{ color: item.stock > 5 ? 'var(--accent)' : '#F59E0B' }}>
                        {isOut ? '❌ Stok habis' : item.stock <= 5 ? `⚠️ Sisa ${item.stock} porsi` : `✅ Tersedia (${item.stock} porsi)`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold">Menu tidak ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* ─── CART VIEW ─── */}
        {view === 'cart' && (
          <div className="max-w-lg mx-auto">
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>🛒 Keranjang Belanja</h2>
            {cart.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
                <p className="text-5xl mb-4">🛒</p>
                <p className="font-bold text-lg mb-1">Keranjang masih kosong</p>
                <p className="text-sm mb-6">Yuk, pilih menu favoritmu!</p>
                <button onClick={() => setView('menu')} className="px-6 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  Lihat Menu
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={item.menuItem.id} className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                        <img src={item.menuItem.image} alt={item.menuItem.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.menuItem.name}</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{formatRupiah(item.menuItem.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.menuItem.id, -1)} className="w-7 h-7 rounded-lg font-bold flex items-center justify-center"
                          style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>−</button>
                        <span className="font-bold text-sm w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.menuItem.id, 1)} className="w-7 h-7 rounded-lg font-bold flex items-center justify-center"
                          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>+</button>
                      </div>
                      <p className="text-sm font-black w-20 text-right">{formatRupiah(item.menuItem.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="rounded-2xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--muted-foreground)' }}>Subtotal ({cartCount} item)</span>
                    <span className="font-semibold">{formatRupiah(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--muted-foreground)' }}>Saldo kamu</span>
                    <span className="font-semibold" style={{ color: balance >= cartTotal ? 'var(--accent)' : '#EF4444' }}>
                      {formatRupiah(balance)}
                    </span>
                  </div>
                  <div className="h-px my-3" style={{ background: 'var(--border)' }} />
                  <div className="flex justify-between font-black">
                    <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Total</span>
                    <span style={{ color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatRupiah(cartTotal)}</span>
                  </div>
                </div>

                {balance < cartTotal && (
                  <p className="text-sm text-center mb-3 font-semibold" style={{ color: '#EF4444' }}>
                    ⚠️ Saldo tidak cukup! Kurang {formatRupiah(cartTotal - balance)}
                  </p>
                )}

                <button
                  onClick={() => setConfirmModal(true)}
                  disabled={balance < cartTotal}
                  className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
                >
                  Bayar Sekarang — {formatRupiah(cartTotal)}
                </button>
              </>
            )}
          </div>
        )}

        {/* ─── ORDERS VIEW ─── */}
        {view === 'orders' && (
          <div>
            <h2 className="text-xl font-black mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>📋 Riwayat Pesanan</h2>

            {lastOrder && lastOrder.status !== 'selesai' && (
              <div className="rounded-2xl p-5 mb-6 relative overflow-hidden"
                style={{ background: 'var(--primary)', color: 'white' }}>
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-20" style={{ background: '#fff' }} />
                <p className="text-orange-100 text-sm font-semibold mb-1">Pesanan terbarumu</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>#{lastOrder.queueNumber}</p>
                    <p className="text-orange-100 text-sm">Nomor antrean</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-orange-800"
                      style={{ background: 'rgba(255,255,255,0.9)' }}>
                      {statusConfig[lastOrder.status]?.label}
                    </span>
                    <p className="text-orange-100 text-xs mt-1">Status pesanan</p>
                  </div>
                </div>
              </div>
            )}

            {myOrders.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'var(--muted-foreground)' }}>
                <p className="text-5xl mb-4">📋</p>
                <p className="font-bold text-lg mb-1">Belum ada pesanan</p>
                <p className="text-sm mb-6">Mulai pesan makananmu sekarang!</p>
                <button onClick={() => setView('menu')} className="px-6 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  Lihat Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {[...myOrders].reverse().map(order => {
                  const st = statusConfig[order.status] || statusConfig.menunggu;
                  return (
                    <div key={order.id} className="rounded-2xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>
                              #{order.queueNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-sm" style={{ color: 'var(--primary)' }}>{formatRupiah(order.total)}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: '#DCFCE7', color: '#15803D' }}>✓ Sudah Dibayar</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {order.items.map(item => (
                          <div key={item.menuItem.id} className="flex justify-between text-xs">
                            <span style={{ color: 'var(--muted-foreground)' }}>{item.menuItem.name} × {item.quantity}</span>
                            <span className="font-semibold">{formatRupiah(item.menuItem.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating cart button on menu view */}
      {view === 'menu' && cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setView('cart')}
            className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            <span className="bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-xs font-black">{cartCount}</span>
            Lihat Keranjang — {formatRupiah(cartTotal)}
          </button>
        </div>
      )}

      {/* Confirm payment modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'var(--card)' }}>
            <h3 className="text-lg font-black mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Konfirmasi Pembayaran</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
              Pembayaran akan dipotong dari saldo dompet digitalmu.
            </p>
            <div className="flex justify-between font-bold mb-6 text-sm">
              <span>Total Bayar</span>
              <span style={{ color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatRupiah(cartTotal)}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(false)} className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>Batal</button>
              <button onClick={() => { setConfirmModal(false); handleCheckout(); }}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Bayar Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
