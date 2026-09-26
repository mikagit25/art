import { Controller, Post, Body, Get, Req, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RegisterArtistDto, RefreshTokenDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register buyer' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/artist')
  @Public()
  @ApiOperation({ summary: 'Register artist' })
  registerArtist(@Body() dto: RegisterArtistDto) {
    return this.authService.registerArtist(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth' })
  googleAuth() {}

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() req: any, @Res() res: any) {
    const tokens = await this.authService.googleLogin(req.user);
    const frontendUrl = this.config.get('FRONTEND_URL', 'https://mikheyeva.art');
    const params = new URLSearchParams({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: tokens.user.id,
      email: tokens.user.email,
      role: tokens.user.role,
    });
    res.redirect(`${frontendUrl}/auth/google/callback?${params.toString()}`);
  }
}
