'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Image, ShoppingBag, BarChart3, Settings, CreditCard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/artworks', label: 'Мои работы', icon: Image },
  { href: '/dashboard/orders', label: 'Заказы', icon: ShoppingBag },
  { href: '/dashboard/stats', label: 'Статистика', icon: BarChart3 },
  { href: '/dashboard/payouts', label: 'Выплаты', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Профиль', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (!['ARTIST', 'PARTNER_ARTIST', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
      router.push('/');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <Link href="/" className="font-serif text-lg font-bold text-primary">Mikheyeva</Link>
          <p className="text-xs text-muted-foreground mt-0.5">Личный кабинет</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate mb-2">{user?.email}</div>
          <button
            onClick={() => { clearAuth(); router.push('/'); }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center gap-3 p-4 border-b border-border bg-card overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                <item.icon className="h-3 w-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
