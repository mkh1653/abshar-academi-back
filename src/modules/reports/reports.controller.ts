import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('admin/reports/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  attendance(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('coachId') coachId?: string,
  ) {
    return this.reports.attendance(from, to, coachId);
  }

  @Get('admin/reports/players-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  playersSummary() {
    return this.reports.playersSummary();
  }

  @Get('players/:playerId/performance-summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  performance(@Param('playerId') playerId: string) {
    return this.reports.performance(playerId);
  }
}
