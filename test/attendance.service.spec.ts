import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from '../src/modules/attendance/attendance.service';

describe('AttendanceService', () => {
  it('rejects an invalid QR token', async () => {
    const jwt = {
      verifyAsync: jest.fn().mockRejectedValue(new Error('invalid')),
    };

    const config = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
    };

    const service = new AttendanceService(
      jwt as never,
      config as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.markQr({ token: 'bad', playerId: 'player-1' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
