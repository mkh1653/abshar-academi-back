import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { Coach } from './entities/coach.entity';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coach, User]),
    AuthModule,
  ],
  controllers: [CoachesController],
  providers: [CoachesService],
  exports: [CoachesService, TypeOrmModule],
})
export class CoachesModule {}
