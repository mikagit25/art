'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArtworkCard } from '@/components/catalog/ArtworkCard';
import { artworksApi } from '@/lib/api';
import { CATEGORY_LABELS } from '@/lib/utils';
import { SlidersHorizontal, X } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'date', label: 'По дате' },
  { value: 'price_asc', label: 'Цена: по возрастанию' },
  { value: 'price_desc', label: 'Цена: по убыванию' },
  { value: 'popular', label: 'По популярности' },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const params = {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    type: searchParams.get('type') || undefined,
    sortBy: searchParams.get('sortBy') || 'date',
    priceMin: searchParams.get('priceMin') || undefined,
    priceMax: searchParams.get('priceMax') || undefined,
    available: searchParams.get('available') === 'true' ? true : undefined,
    page: Number(searchParams.get('page')) || 1,
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['artworks', params],
    queryFn: () => artworksApi.getAll(params).then((r) => r.data),
  });

  const updateParam = (key: string, value: string | null) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value === null || value === '') sp.delete(key);
    else sp.set(key, value);
    if (key !== 'page') sp.set('page', '1');
    router.push(`/catalog?${sp.toString()}`);
  };

  const clearFilters = () => {
    router.push('/catalog');
  };

  const hasFilters = params.search || params.category || params.type || params.priceMin || params.priceMax;

  return (
    <MainLayout>
      <div className="gallery-container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold">Каталог</h1>
            {data && (
              <p className="text-muted-foreground text-sm mt-1">
                {data.total} работ{hasFilters && ' по фильтрам'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
                <X className="h-4 w-4" /> Сбросить фильтры
              </button>
            )}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 btn-outline py-2 px-4"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:block">Фильтры</span>
            </button>
            <select
              value={params.sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="input-field w-auto h-10"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters panel */}
        {filtersOpen && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
            {/* Search */}
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-medium mb-1 block">Поиск</label>
              <input
                type="text"
                defaultValue={params.search}
                placeholder="Название, художник..."
                className="input-field"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateParam('search', e.currentTarget.value);
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-medium mb-1 block">Категория</label>
              <select
                value={params.category || ''}
                onChange={(e) => updateParam('category', e.target.value || null)}
                className="input-field"
              >
                <option value="">Все</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium mb-1 block">Тип</label>
              <select
                value={params.type || ''}
                onChange={(e) => updateParam('type', e.target.value || null)}
                className="input-field"
              >
                <option value="">Все</option>
                <option value="ORIGINAL">Оригинал</option>
                <option value="PRINT">Принт</option>
                <option value="DIGITAL">Цифровая</option>
                <option value="NFT">NFT</option>
              </select>
            </div>

            {/* Price range */}
            <div>
              <label className="text-xs font-medium mb-1 block">Цена, от</label>
              <input
                type="number"
                defaultValue={params.priceMin}
                placeholder="0"
                className="input-field"
                onBlur={(e) => updateParam('priceMin', e.target.value || null)}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Цена, до</label>
              <input
                type="number"
                defaultValue={params.priceMax}
                placeholder="∞"
                className="input-field"
                onBlur={(e) => updateParam('priceMax', e.target.value || null)}
              />
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {params.search && (
              <span className="badge-primary flex items-center gap-1">
                Поиск: {params.search}
                <button onClick={() => updateParam('search', null)}><X className="h-3 w-3" /></button>
              </span>
            )}
            {params.category && (
              <span className="badge-primary flex items-center gap-1">
                {CATEGORY_LABELS[params.category]}
                <button onClick={() => updateParam('category', null)}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-muted animate-pulse aspect-square" />
            ))}
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🎨</p>
            <h3 className="font-serif text-xl font-medium mb-2">Работы не найдены</h3>
            <p className="text-muted-foreground">Попробуйте изменить фильтры поиска</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(data?.items || []).map((artwork: any) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => updateParam('page', String(page))}
                className={`w-10 h-10 rounded-md text-sm font-medium transition-colors
                  ${page === params.page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-accent'
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="gallery-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-muted animate-pulse aspect-square" />
            ))}
          </div>
        </div>
      </MainLayout>
    }>
      <CatalogContent />
    </Suspense>
  );
}
