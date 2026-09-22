import { ForbiddenException } from '@nestjs/common';
import { AttendanceService } from '../src/modules/attendance/attendance.service';
import { AttendanceStatus } from '../src/modules/attendance/enums/attendance-status.enum';
import { UserRole } from '../src/modules/users/enums/user-role.enum';

describe('AttendanceService security', () => {
  it('does not allow a parent to mark QR attendance for another player', async () => {
    const service = new AttendanceService(
      { verifyAsync: jest.fn().mockResolvedValue({ sessionId: 'session-1', type: 'attendance_qr' }) } as any,
      { getOrThrow: jest.fn().mockReturnValue('qr-secret') } as any,
      {} as any,
      { findOne: jest.fn().mockResolvedValue({
        id: 'attendance-1',
        save: undefined,
      }) } as any,
      {
        findOne: jest.fn()
          .mockResolvedValueOnce({
            id: 'session-1',
            startsAt: new Date(Date.now() - 5 * 60 * 1000),
            endsAt: new Date(Date.now() + 60 * 60 * 1000),
            trainingGroup: { coach: { user: null } },
          })
          .mockResolvedValueOnce({ id: 'player-1', user: null }),
      } as any,
      { findOne: jest.fn().mockResolvedValue(null) } as any,
      { findOne: jest.fn() } as any,
      { findOne: jest.fn() } as any,
    );

    const request = {
      token: 'qr',
      playerId: 'player-1',
    };

    await expect(
      service.markQr(request, {
        id: 'parent-1',
        role: UserRole.PARENT,
      } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
