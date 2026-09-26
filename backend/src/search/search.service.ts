import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';

@Injectable()
export class SearchService implements OnModuleInit {
  private client: MeiliSearch;

  constructor(private config: ConfigService) {
    this.client = new MeiliSearch({
      host: config.get('MEILISEARCH_HOST', 'http://meilisearch:7700'),
      apiKey: config.get('MEILISEARCH_KEY', ''),
    });
  }

  async onModuleInit() {
    await this.setupIndexes().catch((err) => {
      console.warn('Meilisearch not available, search disabled:', err.message);
    });
  }

  private async setupIndexes() {
    await this.client.index('artworks').updateSettings({
      searchableAttributes: ['title', 'description', 'artistName', 'tags', 'technique', 'style'],
      filterableAttributes: ['category', 'type', 'status', 'artistId', 'isSold', 'price'],
      sortableAttributes: ['price', 'viewCount', 'createdAt'],
    });
  }

  async indexArtwork(artwork: any) {
    try {
      await this.client.index('artworks').addDocuments([
        {
          id: artwork.id,
          title: artwork.title,
          description: artwork.description,
          category: artwork.category,
          type: artwork.type,
          status: artwork.status,
          artistId: artwork.artistId,
          artistName: artwork.artist?.displayName,
          tags: artwork.tags,
          technique: artwork.technique,
          style: artwork.style,
          price: Number(artwork.price),
          isSold: artwork.isSold,
          viewCount: artwork.viewCount,
          createdAt: artwork.createdAt?.toISOString(),
          imageUrl: artwork.images?.[0]?.thumbUrl,
          slug: artwork.slug,
        },
      ]);
    } catch {
      // Meilisearch unavailable — skip indexing
    }
  }

  async removeArtwork(id: string) {
    try {
      await this.client.index('artworks').deleteDocument(id);
    } catch {}
  }

  async search(query: string, options?: any) {
    try {
      return await this.client.index('artworks').search(query, {
        filter: ['status = PUBLISHED', 'isSold = false'],
        limit: 20,
        ...options,
      });
    } catch {
      return { hits: [], estimatedTotalHits: 0 };
    }
  }
}
