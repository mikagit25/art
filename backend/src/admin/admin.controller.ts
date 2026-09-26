import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  // Artists
  @Get('artists/pending')
  getPendingArtists() {
    return this.adminService.getPendingArtists();
  }

  @Get('artists')
  getAllArtists(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllArtists(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('artists/:id/approve')
  approveArtist(@Param('id') id: string) {
    return this.adminService.approveArtist(id);
  }

  @Patch('artists/:id/reject')
  rejectArtist(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.rejectArtist(id, reason);
  }

  @Patch('artists/:id/commission')
  updateCommission(@Param('id') id: string, @Body('rate') rate: number) {
    return this.adminService.updateArtistCommission(id, rate);
  }

  // Artworks
  @Get('artworks/pending')
  getPendingArtworks() {
    return this.adminService.getPendingArtworks();
  }

  @Get('artworks')
  getAllArtworks(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllArtworks(Number(page) || 1, Number(limit) || 20, status);
  }

  @Patch('artworks/:id/approve')
  approveArtwork(@Param('id') id: string) {
    return this.adminService.approveArtwork(id);
  }

  @Patch('artworks/:id/reject')
  rejectArtwork(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.rejectArtwork(id, reason);
  }

  // Banners
  @Get('banners')
  getBanners() {
    return this.adminService.getBanners();
  }

  @Post('banners')
  createBanner(@Body() data: any) {
    return this.adminService.createBanner(data);
  }

  @Put('banners/:id')
  updateBanner(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateBanner(id, data);
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }

  // Settings
  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings/:key')
  updateSetting(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateSetting(key, value);
  }

  // Categories
  @Get('categories')
  getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  createCategory(@Body() data: any) {
    return this.adminService.createCategory(data);
  }

  @Put('categories/:id')
  updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.adminService.updateCategory(id, data);
  }

  // Reports
  @Get('reports/financial')
  getFinancialReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.adminService.getFinancialReport(from, to);
  }

  // Users
  @Get('users')
  getAllUsers(@Query('page') page: string, @Query('limit') limit: string) {
    return this.adminService.getAllUsers(Number(page) || 1, Number(limit) || 20);
  }

  @Patch('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: string) {
    return this.adminService.updateUserRole(id, role);
  }

  @Patch('users/:id/toggle-active')
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id);
  }
}
