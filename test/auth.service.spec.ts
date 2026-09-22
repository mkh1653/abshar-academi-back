import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService', () => {
  const users = {
    findByLogin: jest.fn(),
  };
  const refreshRepo = {
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => value),
    findOne: jest.fn(),
  };
  const jwt = {
    signAsync: jest.fn(async () => 'token'),
    verifyAsync: jest.fn(),
  };
  const config = {
    getOrThrow: jest.fn((key: string) => ({
      JWT_ACCESS_SECRET: 'access',
      JWT_REFRESH_SECRET: 'refresh',
      JWT_ACCESS_TTL_SECONDS: '900',
      JWT_REFRESH_TTL_SECONDS: '3600',
    }[key])),
  };

  beforeEach(() => jest.clearAllMocks());

  it('logs in with valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 4);
    users.findByLogin.mockResolvedValue({
      id: 'user-1',
      mobile: '0912',
      email: null,
      passwordHash,
      role: 'PARENT',
      isActive: true,
    });

    const service = new AuthService(
      config as never,
      jwt as never,
      users as never,
      refreshRepo as never,
    );

    const result = await service.login({ login: '0912', password: 'password123' });
    expect(result.accessToken).toBe('token');
    expect(result.refreshToken).toBe('token');
    expect(refreshRepo.save).toHaveBeenCalled();
  });

  it('rejects invalid credentials', async () => {
    users.findByLogin.mockResolvedValue(null);

    const service = new AuthService(
      config as never,
      jwt as never,
      users as never,
      refreshRepo as never,
    );

    await expect(
      service.login({ login: '0912', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
