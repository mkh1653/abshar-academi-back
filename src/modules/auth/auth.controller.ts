import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshTokenDto): Promise<{ success: true }> {
    await this.authService.logout(dto);
    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: User): Pick<User, 'id' | 'mobile' | 'email' | 'role'> {
    return {
      id: user.id,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
    };
  }
}
