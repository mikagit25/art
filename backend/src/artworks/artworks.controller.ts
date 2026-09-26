import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
  UseGuards, UploadedFile, UseInterceptors, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtworksService } from './artworks.service';
import {
  CreateArtworkDto, UpdateArtworkDto, ArtworkQueryDto, UpdateArtworkStatusDto,
} from './dto/artwork.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Artworks')
@Controller('artworks')
@UseGuards(JwtAuthGuard)
export class ArtworksController {
  constructor(private artworksService: ArtworksService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get artwork catalog' })
  findAll(@Query() query: ArtworkQueryDto) {
    return this.artworksService.findAll(query);
  }

  @Get('new')
  @Public()
  @ApiOperation({ summary: 'Get new artworks for homepage' })
  getNew() {
    return this.artworksService.getNew();
  }

  @Get('popular')
  @Public()
  @ApiOperation({ summary: 'Get popular artworks for homepage' })
  getPopular() {
    return this.artworksService.getPopular();
  }

  @Get('my')
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Get own artworks' })
  getMyArtworks(
    @CurrentUser('id') userId: string,
    @Query() query: ArtworkQueryDto,
  ) {
    return this.artworksService.getMyArtworks(userId, query);
  }

  @Get('favorites')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get favorite artworks' })
  getFavorites(@CurrentUser('id') userId: string) {
    return this.artworksService.getFavorites(userId);
  }

  @Post()
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Create artwork' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateArtworkDto,
  ) {
    return this.artworksService.create(userId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Update artwork' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateArtworkDto,
  ) {
    return this.artworksService.update(id, userId, dto, role);
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Update artwork status' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Body() dto: UpdateArtworkStatusDto,
  ) {
    return this.artworksService.updateStatus(id, userId, dto, role);
  }

  @Post(':id/images')
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload artwork image' })
  uploadImage(
    @Param('id') artworkId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('order') order: string,
  ) {
    return this.artworksService.uploadImage(artworkId, userId, file, Number(order) || 0);
  }

  @Delete('images/:imageId')
  @ApiBearerAuth()
  @Roles(Role.ARTIST)
  @ApiOperation({ summary: 'Delete artwork image' })
  deleteImage(
    @Param('imageId') imageId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.artworksService.deleteImage(imageId, userId);
  }

  @Post(':id/favorite')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favorite' })
  toggleFavorite(
    @Param('id') artworkId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.artworksService.toggleFavorite(artworkId, userId);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get artwork by slug' })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.artworksService.findBySlug(slug, userId);
  }
}
