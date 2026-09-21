import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerDocument } from './entities/player-document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerDocument])],
  exports: [TypeOrmModule],
})
export class DocumentsModule {}
