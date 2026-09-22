import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { PlayerQueryDto } from './dto/player-query.dto';
import { RegisterPlayerDto } from './dto/register-player.dto';
import { ChangeLevelDto } from './dto/change-level.dto';
import { AssignCoachDto } from './dto/assign-coach.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { UpdatePlayerByParentDto } from './dto/update-player-by-parent.dto';
import { PlayersService } from './players.service';

@Controller()
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post('registrations')
  register(@Body() dto: RegisterPlayerDto) {
    return this.playersService.register(dto);
  }

  @Get('players')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH)
  list(@Query() query: PlayerQueryDto, @CurrentUser() user: User) {
    return this.playersService.list(query, user);
  }

  @Get('players/my-children')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT)
  myChildren(@CurrentUser() user: User) {
    return this.playersService.getMyChildren(user.id);
  }

  @Get('players/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  getById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.playersService.getForUser(id, user);
  }

  @Patch('admin/players/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePlayerDto) {
    return this.playersService.update(id, dto);
  }

  @Patch('players/:id/parent-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARENT)
  updateByParent(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerByParentDto,
    @CurrentUser() user: User,
  ) {
    return this.playersService.getForUser(id, user).then(() =>
      this.playersService.updateParentProfile(id, dto),
    );
  }

  @Get('coach/training-groups/:groupId/players')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH, UserRole.ADMIN)
  playersByGroup(@Param('groupId') groupId: string, @CurrentUser() user: User) {
    return this.playersService.listByTrainingGroup(groupId, user);
  }

  @Patch('admin/players/:id/coach')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  assignCoach(@Param('id') id: string, @Body() dto: AssignCoachDto) {
    return this.playersService.assignCoach(id, dto);
  }

  @Patch('admin/players/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.playersService.changeStatus(id, dto);
  }

  @Patch('coach/players/:id/technical-level')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  changeTechnicalLevel(
    @Param('id') id: string,
    @Body() dto: ChangeLevelDto,
    @CurrentUser() user: User,
  ) {
    return this.playersService.changeTechnicalLevel(id, dto, user);
  }

  @Post('players/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  approve(@Param('id') id: string) {
    return this.playersService.approve(id);
  }
}
