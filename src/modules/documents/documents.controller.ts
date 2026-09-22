import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { DocumentsService } from './documents.service';
import { PlayerDocumentType } from './enums/player-document-type.enum';

@Controller()
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  @Post('players/:playerId/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.PARENT)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
      const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
      callback(null, allowed.includes(file.mimetype));
    },
  }))
  upload(
    @Param('playerId') playerId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Query('type') type: PlayerDocumentType,
    @Query('expiresAt') expiresAt?: string,
  ) {
    if (!file) throw new BadRequestException('A valid PDF/JPG/PNG file is required');
    if (!Object.values(PlayerDocumentType).includes(type)) {
      throw new BadRequestException('Invalid document type');
    }
    return this.documents.upload(playerId, user, file, type, expiresAt);
  }

  @Get('players/:playerId/documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  list(@Param('playerId') playerId: string, @CurrentUser() user: User) {
    return this.documents.listForPlayer(playerId, user);
  }

  @Get('documents/:id/file')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.PARENT)
  async file(@Param('id') id: string, @CurrentUser() user: User, @Res() res: Response) {
    const path = await this.documents.pathForDocument(id, user);
    return res.sendFile(path);
  }
}
