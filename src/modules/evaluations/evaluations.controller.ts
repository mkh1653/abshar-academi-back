import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { EvaluationsService } from './evaluations.service';

@Controller()
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @Post('coach/assessments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  create(@Body() dto: CreateAssessmentDto, @CurrentUser() user: User) {
    return this.evaluationsService.create(dto, user);
  }

  @Get('players/:playerId/assessments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  list(@Param('playerId') playerId: string, @CurrentUser() user: User) {
    return this.evaluationsService.listForPlayer(playerId, user);
  }
}
