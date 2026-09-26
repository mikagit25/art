'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { paymentsApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function DashboardPayoutsPage() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['payout-settings'],
    queryFn: () => paymentsApi.getPayoutSettings().then((r) => r.data),
  });

  const { data: transactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => paymentsApi.getTransactions().then((r) => r.data),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (settings) reset(settings);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: any) => paymentsApi.updatePayoutSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payout-settings'] });
      toast.success('Реквизиты сохранены');
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Выплаты</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings */}
        <div>
          <h2 className="font-medium mb-4">Реквизиты для выплат</h2>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Банк</label>
              <input className="input-field" placeholder="Сбербанк, Тинькофф..." {...register('bankName')} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Номер карты</label>
              <input className="input-field" placeholder="4276 •••• •••• ••••" {...register('cardNumber')} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Номер счёта</label>
              <input className="input-field" placeholder="40817..." {...register('bankAccount')} />
            </div>
            <div className="border-t border-border pt-4">
              <label className="text-sm font-medium mb-1 block">Или электронный кошелёк</label>
              <select className="input-field mb-2" {...register('walletType')}>
                <option value="">Выберите...</option>
                <option value="yoomoney">ЮMoney</option>
                <option value="qiwi">QIWI</option>
                <option value="webmoney">WebMoney</option>
              </select>
              <input className="input-field" placeholder="Номер кошелька" {...register('walletId')} />
            </div>
            <button type="submit" disabled={mutation.isPending} className="btn-primary w-full">
              {mutation.isPending ? 'Сохранение...' : 'Сохранить реквизиты'}
            </button>
          </form>
        </div>

        {/* Transactions */}
        <div>
          <h2 className="font-medium mb-4">История транзакций</h2>
          {!transactions?.length ? (
            <p className="text-muted-foreground text-sm">Транзакций пока нет</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-muted rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{t.type}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
                  </div>
                  <p className={`font-bold ${t.type === 'PAYOUT' ? 'text-green-600' : 'text-foreground'}`}>
                    {formatPrice(t.amount, t.currency)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
