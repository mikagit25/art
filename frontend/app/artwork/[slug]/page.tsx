import { MainLayout } from '@/components/layout/MainLayout';
import { ArtworkDetail } from '@/components/artwork/ArtworkDetail';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://backend:4000/api/v1'}/artworks/${params.slug}`,
    );
    if (!res.ok) return {};
    const artwork = await res.json();
    return {
      title: `${artwork.title} — ${artwork.artist?.displayName}`,
      description: artwork.description,
      openGraph: {
        title: artwork.title,
        description: artwork.description,
        images: artwork.images?.[0] ? [{ url: artwork.images[0].url }] : [],
      },
    };
  } catch {
    return {};
  }
}

export default function ArtworkPage({ params }: Props) {
  return (
    <MainLayout>
      <ArtworkDetail slug={params.slug} />
    </MainLayout>
  );
}
