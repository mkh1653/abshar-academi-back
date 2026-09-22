import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { BulkAttendanceDto } from './dto/bulk-attendance.dto';
import { QrAttendanceDto } from './dto/qr-attendance.dto';
import { GuestAttendanceDto } from './dto/guest-attendance.dto';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('admin/training-sessions/:id/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  createQr(@Param('id') id: string) {
    return this.attendanceService.createQr(id);
  }

  @Post('admin/training-sessions/:id/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  markBulk(@Param('id') id: string, @Body() dto: BulkAttendanceDto) {
    return this.attendanceService.markBulk(id, dto);
  }

  @Post('admin/training-sessions/:id/guests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  addGuest(@Param('id') id: string, @Body() dto: GuestAttendanceDto) {
    return this.attendanceService.addGuest(id, dto);
  }

  @Get('admin/training-sessions/:id/guests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  listGuests(@Param('id') id: string) {
    return this.attendanceService.listGuests(id);
  }

  @Post('attendance/qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT, UserRole.PLAYER)
  markQr(@Body() dto: QrAttendanceDto) {
    return this.attendanceService.markQr(dto);
  }

  @Get('players/:playerId/attendance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  list(@Param('playerId') id: string, @CurrentUser() user: User) {
    return this.attendanceService.listForPlayer(id, user);
  }
}
