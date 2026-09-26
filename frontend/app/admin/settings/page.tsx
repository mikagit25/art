'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.getSettings().then((r) => r.data),
  });

  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => adminApi.updateSetting(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast.success('Настройки сохранены');
    },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold mb-6">Настройки платформы</h1>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4 max-w-lg">
          {(settings || []).map((s: any) => (
            <div key={s.key} className="bg-card rounded-xl border border-border p-4">
              <label className="text-sm font-medium block mb-1">{s.key}</label>
              {s.description && <p className="text-xs text-muted-foreground mb-2">{s.description}</p>}
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  defaultValue={s.value}
                  onChange={(e) => setEditValues((prev) => ({ ...prev, [s.key]: e.target.value }))}
                />
                <button
                  onClick={() => mutation.mutate({ key: s.key, value: editValues[s.key] ?? s.value })}
                  className="btn-outline px-4"
                >
                  Сохранить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
