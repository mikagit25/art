'use client';

import { useQuery } from '@tanstack/react-query';
import { artistsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Eye, ShoppingBag, DollarSign, Heart } from 'lucide-react';

export default function DashboardStatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist', 'stats'],
    queryFn: () => artistsApi.getMyStats().then((r) => r.data),
  });

  const stats = data?.stats;

  const STAT_CARDS = [
    { label: 'Всего просмотров', value: stats?.totalViews || 0, icon: Eye },
    { label: 'Продаж', value: stats?.totalSales || 0, icon: ShoppingBag },
    { label: 'Общий доход', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign },
  ];

  if (isLoading) return <div className="animate-pulse space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl" />)}</div>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Статистика</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {data?.artworksByStatus && (
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-medium mb-4">Работы по статусам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.artworksByStatus.map((s: any) => (
              <div key={s.status} className="text-center py-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{s._count.id}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
