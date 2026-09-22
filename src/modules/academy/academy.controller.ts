import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateHallDto } from './dto/create-hall.dto';
import { CreateTrainingGroupDto } from './dto/create-training-group.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { EnrollPlayerDto } from './dto/enroll-player.dto';
import { AcademyService } from './academy.service';

@Controller()
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  @Get('levels')
  listLevels() {
    return this.academyService.listLevels();
  }

  @Get('halls')
  listHalls() {
    return this.academyService.listHalls();
  }

  @Get('training-groups')
  listTrainingGroups() {
    return this.academyService.listTrainingGroups();
  }

  @Post('admin/halls')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createHall(@Body() dto: CreateHallDto) {
    return this.academyService.createHall(dto);
  }

  @Post('admin/training-groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createTrainingGroup(@Body() dto: CreateTrainingGroupDto) {
    return this.academyService.createTrainingGroup(dto);
  }

  @Post('admin/training-groups/:id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  enrollPlayer(@Param('id') id: string, @Body() dto: EnrollPlayerDto) {
    return this.academyService.enrollPlayer(id, dto);
  }

  @Post('admin/training-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  createSession(@Body() dto: CreateTrainingSessionDto) {
    return this.academyService.createSession(dto);
  }

  @Get('players/:playerId/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  schedule(@Param('playerId') playerId: string, @CurrentUser() user: User) {
    return this.academyService.getPlayerSchedule(playerId, user);
  }

  @Get('players/:playerId/upcoming-sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  upcoming(@Param('playerId') playerId: string, @CurrentUser() user: User) {
    return this.academyService.upcomingSessions(playerId, user);
  }
}
