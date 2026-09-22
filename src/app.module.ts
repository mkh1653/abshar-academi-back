import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { AcademyModule } from './modules/academy/academy.module';
import { CoachesModule } from './modules/coaches/coaches.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FinanceModule } from './modules/finance/finance.module';
import { EvaluationsModule } from './modules/evaluations/evaluations.module';
import { PlayersModule } from './modules/players/players.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ShopModule } from './modules/shop/shop.module';
import { ContentModule } from './modules/content/content.module';
import { ProgressModule } from './modules/progress/progress.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
    }),
    UsersModule,
    AuthModule,
    CoachesModule,
    PlayersModule,
    NotificationsModule,
    ShopModule,
    ContentModule,
    AcademyModule,
    AttendanceModule,
    EvaluationsModule,
    ProgressModule,
    DocumentsModule,
    FinanceModule,
  ],
})
export class AppModule {}
