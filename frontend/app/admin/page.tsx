'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Image, ShoppingBag, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data),
  });

  if (isLoading) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>;

  const stats = data?.stats;

  const CARDS = [
    { label: 'Пользователей', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', href: '/admin/users' },
    { label: 'Художников', value: stats?.totalArtists, icon: Users, color: 'text-green-500', href: '/admin/artists' },
    { label: 'Работ', value: stats?.totalArtworks, icon: Image, color: 'text-amber-500', href: '/admin/artworks' },
    { label: 'Заказов', value: stats?.totalOrders, icon: ShoppingBag, color: 'text-purple-500', href: '/admin/orders' },
    { label: 'Выручка', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-primary', href: '/admin/reports' },
    { label: 'Комиссия', value: formatPrice(stats?.totalCommission || 0), icon: DollarSign, color: 'text-orange-500', href: '/admin/reports' },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Дашборд</h1>

      {/* Alerts */}
      {(stats?.pendingArtists > 0 || stats?.pendingArtworks > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {stats.pendingArtists > 0 && (
            <Link href="/admin/artists?status=PENDING" className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 hover:bg-yellow-100">
              <AlertCircle className="h-4 w-4" />
              {stats.pendingArtists} художников ожидают одобрения
            </Link>
          )}
          {stats.pendingArtworks > 0 && (
            <Link href="/admin/artworks?status=PENDING_REVIEW" className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700 hover:bg-yellow-100">
              <AlertCircle className="h-4 w-4" />
              {stats.pendingArtworks} работ ожидают модерации
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {CARDS.map((card) => (
          <Link key={card.label} href={card.href} className="bg-card rounded-xl border border-border p-5 hover:border-primary transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {data?.recentOrders?.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4" /> Последние заказы
          </h2>
          <div className="space-y-3">
            {data.recentOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="text-muted-foreground ml-2">{order.user?.email}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">{formatDate(order.createdAt)}</span>
                  <span className="font-medium text-primary">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
