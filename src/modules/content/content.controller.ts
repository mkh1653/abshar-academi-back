import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';
import { CreateMatchDto } from './dto/create-match.dto';
import { CreateNewsDto } from './dto/create-news.dto';
import { ContentService } from './content.service';

@Controller()
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('news')
  news() {
    return this.content.listNews();
  }

  @Get('matches')
  matches() {
    return this.content.listMatches();
  }

  @Post('admin/news')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createNews(@Body() dto: CreateNewsDto) {
    return this.content.createNews(dto);
  }

  @Post('admin/matches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createMatch(@Body() dto: CreateMatchDto) {
    return this.content.createMatch(dto);
  }
}
