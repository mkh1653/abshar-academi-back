import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { UserRole } from '../src/modules/users/enums/user-role.enum';

describe('RolesGuard', () => {
  it('allows requests when no role metadata is defined', () => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a user with a required role', () => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a user without a required role', () => {
    const reflector = new Reflector();
    const guard = new RolesGuard(reflector);
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: UserRole.PARENT } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(false);
  });
});
