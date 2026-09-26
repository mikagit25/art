'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, Users, Image, ShoppingBag, Settings, BarChart3, Megaphone, Shield } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/artists', label: 'Художники', icon: Users },
  { href: '/admin/artworks', label: 'Работы', icon: Image },
  { href: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/banners', label: 'Баннеры', icon: Megaphone },
  { href: '/admin/reports', label: 'Отчёты', icon: BarChart3 },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '')) {
      router.push('/');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 hidden md:flex flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <Link href="/" className="font-serif text-lg font-bold text-primary">Admin Panel</Link>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Mikheyeva Art Gallery</p>
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
                  isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Вернуться на сайт
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <div className="md:hidden flex items-center gap-2 p-4 border-b border-border bg-card overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap',
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
