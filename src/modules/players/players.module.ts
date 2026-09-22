import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Coach } from '../coaches/entities/coach.entity';
import { Level } from '../academy/entities/level.entity';
import { UsersModule } from '../users/users.module';
import { Guardian } from './entities/guardian.entity';
import { PlayerGuardian } from './entities/player-guardian.entity';
import { Player } from './entities/player.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player, Guardian, PlayerGuardian, Level, Coach]),
    UsersModule,
    AuthModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [TypeOrmModule, PlayersService],
})
export class PlayersModule {}
