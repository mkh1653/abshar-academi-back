import { BadRequestException } from '@nestjs/common';
import { PlayersService } from '../src/modules/players/players.service';
import { PlayerGoal } from '../src/modules/players/enums/player-goal.enum';
import { PlayerGender } from '../src/modules/players/enums/player-gender.enum';
import { Handedness } from '../src/modules/players/enums/handedness.enum';

describe('PlayersService registration', () => {
  it('requires at least one parent mobile', async () => {
    const players = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    const service = new PlayersService(
      { transaction: jest.fn() } as never,
      players as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const dto = {
      firstNameFa: 'علی',
      lastNameFa: 'رضایی',
      fullNameLatin: 'Ali Rezaei',
      birthDate: '2012-01-01',
      nationalId: '0012345678',
      gender: PlayerGender.MALE,
      heightCm: 150,
      weightKg: 45,
      dominantHand: Handedness.RIGHT,
      emergencyContact: '09120000000',
      address: 'Tehran',
      goal: PlayerGoal.RECREATION_HEALTH,
      startTrainingMonth: '2026-09-01',
      insuranceExpiryDate: '2027-09-01',
      fatherFirstName: 'حسن',
      fatherLastName: 'رضایی',
      motherFirstName: 'مریم',
      motherLastName: 'رضایی',
      parentalConsent: true,
      mediaConsent: false,
      academyTermsAccepted: true,
    };

    await expect(service.register(dto as never)).rejects.toBeInstanceOf(BadRequestException);
  });
});
