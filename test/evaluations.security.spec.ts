import { ForbiddenException } from '@nestjs/common';
import { EvaluationsService } from '../src/modules/evaluations/evaluations.service';
import { UserRole } from '../src/modules/users/enums/user-role.enum';

describe('EvaluationsService security', () => {
  it('does not allow a coach to assess a player assigned to another coach', async () => {
    const service = new EvaluationsService(
      {} as any,
      { findOne: jest.fn().mockResolvedValue({
        id: 'player-1',
        responsibleCoach: { user: { id: 'other-coach' } },
      }) } as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
    );

    await expect(
      service.create(
        { playerId: 'player-1', assessedAt: '2026-09-22' } as any,
        { id: 'coach-1', role: UserRole.COACH } as any,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
