import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Full-text search artworks' })
  search(@Query('q') query: string, @Query('category') category?: string) {
    const filter = category ? [`status = PUBLISHED`, `category = ${category.toUpperCase()}`] : undefined;
    return this.searchService.search(query, filter ? { filter } : undefined);
  }
}
