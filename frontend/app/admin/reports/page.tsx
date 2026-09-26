'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'reports', from, to],
    queryFn: () => adminApi.getFinancialReport({ from: from || undefined, to: to || undefined }).then((r) => r.data),
  });

  const exportCsv = () => {
    if (!data?.orders) return;
    const rows = [
      ['Номер', 'Дата', 'Покупатель', 'Сумма', 'Комиссия', 'Художнику'],
      ...data.orders.map((o: any) => [
        o.orderNumber,
        formatDate(o.createdAt),
        o.user?.email,
        o.totalAmount,
        o.commissionAmount,
        o.artistAmount,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Финансовые отчёты</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="text-xs font-medium block mb-1">С</label>
          <input type="date" className="input-field" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1">По</label>
          <input type="date" className="input-field" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button onClick={() => refetch()} className="btn-primary py-2 px-4 text-sm">Применить</button>
        </div>
        <div className="flex items-end">
          <button onClick={exportCsv} className="btn-outline py-2 px-4 text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Заказов</p>
            <p className="text-2xl font-bold">{data.totalOrders}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Выручка</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(data.totalRevenue)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Комиссия галереи</p>
            <p className="text-2xl font-bold text-green-600">{formatPrice(data.totalCommission)}</p>
          </div>
        </div>
      )}

      {/* Orders table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border font-medium">Транзакции</div>
        {isLoading ? (
          <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Номер', 'Дата', 'Покупатель', 'Итого', 'Комиссия', 'Художнику'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.orders || []).map((order: any) => (
                  <tr key={order.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.user?.email}</td>
                    <td className="px-4 py-3 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="px-4 py-3 text-green-600">{formatPrice(order.commissionAmount)}</td>
                    <td className="px-4 py-3">{formatPrice(order.artistAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
