import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/common/HeroSection';
import { FeaturedArtworks } from '@/components/common/FeaturedArtworks';
import { FeaturedArtists } from '@/components/common/FeaturedArtists';
import { CategoryGrid } from '@/components/common/CategoryGrid';

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <div className="gallery-container py-12 space-y-16">
        <FeaturedArtworks />
        <FeaturedArtists />
        <CategoryGrid />
      </div>
    </MainLayout>
  );
}
