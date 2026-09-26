'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShoppingCart, User, Menu, X, Search, Heart, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useAuthStore, useCartStore } from '@/lib/store';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isArtist = ['ARTIST', 'PARTNER_ARTIST'].includes(user?.role || '');

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearAuth();
    router.push('/');
    toast.success('Вы вышли из аккаунта');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="gallery-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-primary">Mikheyeva</span>
            <span className="hidden sm:block text-xs text-muted-foreground tracking-widest uppercase">Gallery</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/catalog" className="text-sm font-medium hover:text-primary transition-colors">
              Каталог
            </Link>
            <Link href="/artist/marina-mikheyeva" className="text-sm font-medium hover:text-primary transition-colors">
              Михеева
            </Link>
            <Link href="/artists" className="text-sm font-medium hover:text-primary transition-colors">
              Художники
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск..."
                  className="input-field w-40 md:w-60 h-8 text-sm"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-1">
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-primary transition-colors">
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 hover:text-primary transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-border bg-background shadow-lg z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium truncate">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {isArtist && (
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Личный кабинет
                        </Link>
                      )}
                      <Link
                        href="/favorites"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="h-4 w-4" />
                        Избранное
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Мои заказы
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Админ-панель
                        </Link>
                      )}
                      <button
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Выйти
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="p-2 hover:text-primary transition-colors">
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Mobile menu */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            <Link href="/catalog" className="block px-2 py-2 text-sm hover:text-primary" onClick={() => setMobileOpen(false)}>Каталог</Link>
            <Link href="/artist/marina-mikheyeva" className="block px-2 py-2 text-sm hover:text-primary" onClick={() => setMobileOpen(false)}>Михеева</Link>
            <Link href="/artists" className="block px-2 py-2 text-sm hover:text-primary" onClick={() => setMobileOpen(false)}>Художники</Link>
            {!isAuthenticated && (
              <>
                <Link href="/auth/login" className="block px-2 py-2 text-sm hover:text-primary" onClick={() => setMobileOpen(false)}>Войти</Link>
                <Link href="/auth/register" className="block px-2 py-2 text-sm hover:text-primary" onClick={() => setMobileOpen(false)}>Регистрация</Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
