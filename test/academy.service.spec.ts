import { BadRequestException } from '@nestjs/common';
import { AcademyService } from '../src/modules/academy/academy.service';

describe('AcademyService', () => {
  it('rejects a training group when end time is before start time', async () => {
    const halls = {
      findOne: jest.fn().mockResolvedValue({ id: 'hall-1', capacity: 20 }),
    };
    const coaches = {
      findOne: jest.fn().mockResolvedValue({ id: 'coach-1', isActive: true }),
    };
    const levels = {
      findOne: jest.fn().mockResolvedValue({ id: 'level-1' }),
    };

    const service = new AcademyService(
      {} as never,
      levels as never,
      halls as never,
      {} as never,
      {} as never,
      {} as never,
      coaches as never,
      {} as never,
    );

    await expect(
      service.createTrainingGroup({
        name: 'U14',
        levelId: 'level-1',
        hallId: 'hall-1',
        coachId: 'coach-1',
        gender: 'MALE' as never,
        trainingDay: 'SATURDAY' as never,
        startTime: '18:00',
        endTime: '17:00',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
