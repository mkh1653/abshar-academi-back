import { NotFoundException } from '@nestjs/common';
import { AttendanceService } from '../src/modules/attendance/attendance.service';

describe('Guest attendance', () => {
  it('rejects an unknown training session', async () => {
    const service = new AttendanceService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      { findOne: jest.fn().mockResolvedValue(null) } as never,
      {} as never,
      {} as never,
      { save: jest.fn() } as never,
    );

    await expect(
      service.addGuest('missing', {
        guestName: 'Guest',
        guestMobile: '09120000000',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
