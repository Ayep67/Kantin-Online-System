import { useState } from 'react';
import type { User } from '../types';
import { demoUsers } from '../data';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', nim: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = demoUsers.find(u => u.email === form.email);
    if (!user) { setError('Email tidak ditemukan.'); return; }
    if (form.password !== '123456') { setError('Password salah.'); return; }
    onLogin(user);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.nim) { setError('Semua kolom wajib diisi.'); return; }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name: form.name,
      email: form.email,
      role: 'student',
      balance: 100000,
      nim: form.nim,
    };
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--primary)' }}
      >
        {/* geometric shapes */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20" style={{ background: '#FFF' }} />
        <div className="absolute bottom-24 -left-20 w-72 h-72 rounded-full opacity-10" style={{ background: '#FFF' }} />
        <div className="absolute top-1/2 right-8 w-24 h-24 rotate-45 opacity-20" style={{ background: '#FFF' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">🍽️</span>
            <span className="text-3xl font-black text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              SIKANTIN
            </span>
          </div>
          <p className="text-orange-100 text-sm font-medium">Sistem Informasi Kantin Kampus</p>
        </div>

        <div className="relative z-10">
          <blockquote className="text-white text-2xl font-bold leading-snug mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            "Pesan makan siang tanpa antri panjang."
          </blockquote>
          <p className="text-orange-100 text-sm">
            Lihat menu real-time, pesan, bayar, dan ambil makananmu — semua dari genggamanmu.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {['🍗 Ayam Geprek', '🍜 Mie Ayam', '🧋 Es Teh'].map(item => (
            <span key={item} className="px-3 py-1.5 rounded-full text-xs font-semibold text-orange-800" style={{ background: 'rgba(255,255,255,0.85)' }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🍽️</span>
            <span className="text-xl font-black" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--primary)' }}>
              SIKANTIN
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {mode === 'login' ? 'Selamat datang kembali!' : 'Daftar akun baru'}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            {mode === 'login'
              ? 'Masuk ke akun kampusmu untuk mulai memesan.'
              : 'Buat akun dengan email kampus kamu.'}
          </p>

          {/* Demo hint */}
          {mode === 'login' && (
            <div className="rounded-xl p-3 mb-6 text-xs" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
              <p className="font-bold mb-1">Demo akun tersedia:</p>
              <p>🎓 Mahasiswa: <strong>rina@student.ac.id</strong> / <strong>123456</strong></p>
              <p>🏪 Admin: <strong>admin@kantin.ac.id</strong> / <strong>123456</strong></p>
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--card)',
                      border: '2px solid var(--border)',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">NIM</label>
                  <input
                    type="text"
                    placeholder="Nomor Induk Mahasiswa"
                    value={form.nim}
                    onChange={e => setForm(f => ({ ...f, nim: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'var(--card)',
                      border: '2px solid var(--border)',
                      fontFamily: 'Nunito, sans-serif',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1.5">Email Kampus</label>
              <input
                type="email"
                placeholder="nama@student.ac.id"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--border)',
                  fontFamily: 'Nunito, sans-serif',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--card)',
                  border: '2px solid var(--border)',
                  fontFamily: 'Nunito, sans-serif',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {error && (
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {mode === 'login' ? 'Masuk →' : 'Buat Akun →'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--muted-foreground)' }}>
            {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="font-bold underline"
              style={{ color: 'var(--primary)' }}
            >
              {mode === 'login' ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
