import {
  Controller, Get, Put, Patch, Body, Param, Query,
  UseGuards, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ArtistsService } from './artists.service';
import { UpdateArtistDto, ArtistQueryDto } from './dto/artist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UploadsService } from '../uploads/uploads.service';

@ApiTags('Artists')
@Controller('artists')
@UseGuards(JwtAuthGuard)
export class ArtistsController {
  constructor(
    private artistsService: ArtistsService,
    private uploadsService: UploadsService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all active artists' })
  findAll(@Query() query: ArtistQueryDto) {
    return this.artistsService.findAll(query);
  }

  @Get('featured')
  @Public()
  @ApiOperation({ summary: 'Get featured artists for homepage' })
  getFeatured() {
    return this.artistsService.getFeatured();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own artist profile' })
  getMyProfile(@CurrentUser('id') userId: string) {
    return this.artistsService.findByUserId(userId);
  }

  @Get('me/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own artist statistics' })
  getMyStats(@CurrentUser('id') userId: string) {
    return this.artistsService.getStats(userId);
  }

  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own artist profile' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateArtistDto,
  ) {
    return this.artistsService.update(userId, dto);
  }

  @Patch('me/avatar')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload artist avatar' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.uploadsService.uploadImage(file, 'avatars');
    return this.artistsService.updateAvatar(userId, url);
  }

  @Patch('me/cover')
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload artist cover' })
  async uploadCover(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.uploadsService.uploadImage(file, 'covers');
    return this.artistsService.updateCover(userId, url);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get artist by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.artistsService.findBySlug(slug);
  }
}
