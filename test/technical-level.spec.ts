import { ForbiddenException } from '@nestjs/common';
import { PlayersService } from '../src/modules/players/players.service';
import { UserRole } from '../src/modules/users/enums/user-role.enum';

describe('Technical level access', () => {
  it('rejects non-coaches', async () => {
    const service = new PlayersService(
      {} as never,
      { findOne: jest.fn() } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.changeTechnicalLevel(
        'player-1',
        { levelId: 'level-1' },
        { role: UserRole.PARENT } as never,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
