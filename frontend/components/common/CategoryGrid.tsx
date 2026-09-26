import Link from 'next/link';
import { CATEGORY_LABELS } from '@/lib/utils';

const CATEGORIES = [
  { key: 'PAINTING', emoji: '🖌️', color: 'from-amber-100 to-orange-200' },
  { key: 'GRAPHICS', emoji: '✏️', color: 'from-blue-100 to-indigo-200' },
  { key: 'PHOTOGRAPHY', emoji: '📷', color: 'from-gray-100 to-slate-200' },
  { key: 'SCULPTURE', emoji: '🏛️', color: 'from-stone-100 to-zinc-200' },
  { key: 'DIGITAL_ART', emoji: '💻', color: 'from-purple-100 to-violet-200' },
  { key: 'NFT', emoji: '🔷', color: 'from-cyan-100 to-teal-200' },
];

export function CategoryGrid() {
  return (
    <section>
      <div className="mb-8">
        <h2 className="font-serif text-3xl font-bold">По категориям</h2>
        <p className="text-muted-foreground mt-1">Найдите именно то, что ищете</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.key}
            href={`/catalog?category=${cat.key}`}
            className={`group flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br ${cat.color}
              hover:shadow-md transition-all duration-300 hover:-translate-y-1`}
          >
            <span className="text-3xl mb-2">{cat.emoji}</span>
            <span className="text-sm font-medium text-center leading-tight">
              {CATEGORY_LABELS[cat.key]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
