'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TrendingUp, Eye, ShoppingBag, DollarSign, Plus, ArrowRight } from 'lucide-react';
import { artistsApi } from '@/lib/api';
import { formatPrice, STATUS_LABELS } from '@/lib/utils';

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ['artist', 'stats'],
    queryFn: () => artistsApi.getMyStats().then((r) => r.data),
  });

  const stats = data?.stats;

  const STAT_CARDS = [
    { label: 'Просмотров', value: stats?.totalViews || 0, icon: Eye, color: 'text-blue-500' },
    { label: 'Продаж', value: stats?.totalSales || 0, icon: ShoppingBag, color: 'text-green-500' },
    { label: 'Доход', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-amber-500' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold">Личный кабинет</h1>
        <Link href="/dashboard/artworks/new" className="btn-primary py-2 px-4 text-sm">
          <Plus className="h-4 w-4 mr-1" /> Добавить работу
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Artworks by status */}
      {data?.artworksByStatus && (
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-medium mb-4">Работы по статусам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.artworksByStatus.map((s: any) => (
              <div key={s.status} className="text-center">
                <p className="text-2xl font-bold">{s._count.id}</p>
                <p className="text-xs text-muted-foreground">{STATUS_LABELS[s.status] || s.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/artworks" className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors flex items-center justify-between">
          <div>
            <h3 className="font-medium">Управление работами</h3>
            <p className="text-sm text-muted-foreground mt-1">Добавить, редактировать, опубликовать</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/dashboard/orders" className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors flex items-center justify-between">
          <div>
            <h3 className="font-medium">Заказы</h3>
            <p className="text-sm text-muted-foreground mt-1">Просмотр и управление заказами</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/dashboard/profile" className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors flex items-center justify-between">
          <div>
            <h3 className="font-medium">Профиль</h3>
            <p className="text-sm text-muted-foreground mt-1">Настройка профиля и соцсетей</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
        <Link href="/dashboard/payouts" className="bg-card rounded-xl border border-border p-6 hover:border-primary transition-colors flex items-center justify-between">
          <div>
            <h3 className="font-medium">Выплаты</h3>
            <p className="text-sm text-muted-foreground mt-1">Настройка реквизитов и история выплат</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
