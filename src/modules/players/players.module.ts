import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guardian } from './entities/guardian.entity';
import { PlayerGuardian } from './entities/player-guardian.entity';
import { Player } from './entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Player, Guardian, PlayerGuardian])],
  exports: [TypeOrmModule],
})
export class PlayersModule {}
