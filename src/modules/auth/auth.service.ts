import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: 'refresh';
}

interface SafeUser {
  id: string;
  mobile: string | null;
  email: string | null;
  role: User['role'];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByLogin(dto.login);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const tokenHash = this.hashToken(dto.refreshToken);
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revokedAt ||
      storedToken.expiresAt.getTime() <= Date.now() ||
      !storedToken.user.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );

      if (payload.type !== 'refresh' || payload.sub !== storedToken.user.id) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);

    return this.issueTokens(storedToken.user);
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const storedToken = await this.refreshTokensRepository.findOne({
      where: { tokenHash: this.hashToken(dto.refreshToken) },
    });

    if (!storedToken || storedToken.revokedAt) {
      return;
    }

    storedToken.revokedAt = new Date();
    await this.refreshTokensRepository.save(storedToken);
  }

  private async issueTokens(user: User): Promise<AuthResponse> {
    const accessTtl = Number(
      this.configService.getOrThrow<string>('JWT_ACCESS_TTL_SECONDS'),
    );
    const refreshTtl = Number(
      this.configService.getOrThrow<string>('JWT_REFRESH_TTL_SECONDS'),
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        type: 'access',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: accessTtl,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        jti: randomUUID(),
        type: 'refresh',
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTtl,
      },
    );

    const refreshTokenEntity = this.refreshTokensRepository.create({
      user,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTtl * 1000),
      revokedAt: null,
    });

    await this.refreshTokensRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user: this.toSafeUser(user),
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
    };
  }
}
