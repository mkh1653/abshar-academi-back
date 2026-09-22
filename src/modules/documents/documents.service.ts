import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { Player } from '../players/entities/player.entity';
import { PlayerGuardian } from '../players/entities/player-guardian.entity';
import { PlayerDocument } from './entities/player-document.entity';
import { PlayerDocumentType } from './enums/player-document-type.enum';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(PlayerDocument) private readonly documents: Repository<PlayerDocument>,
    @InjectRepository(Player) private readonly players: Repository<Player>,
    @InjectRepository(PlayerGuardian) private readonly playerGuardians: Repository<PlayerGuardian>,
  ) {}

  async upload(
    playerId: string,
    user: User,
    file: Express.Multer.File,
    type: PlayerDocumentType,
    expiresAt?: string,
  ) {
    const player = await this.players.findOne({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Player not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.playerGuardians.findOne({
        where: { player: { id: playerId }, guardian: { user: { id: user.id } } },
      });
      if (!allowed) throw new ForbiddenException('You cannot upload for this player');
    }

    const root = join(process.cwd(), 'storage', 'players', playerId);
    await mkdir(root, { recursive: true });
    const extension = extname(file.originalname).toLowerCase();
    const storageKey = join('players', playerId, randomUUID() + extension);
    const absolutePath = join(process.cwd(), 'storage', storageKey);
    await mkdir(join(process.cwd(), 'storage', 'players', playerId), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    return this.documents.save(
      this.documents.create({
        player,
        uploadedByUser: user,
        type,
        storageKey: storageKey.replaceAll('\\', '/'),
        originalName: file.originalname,
        mimeType: file.mimetype,
        fileSize: String(file.size),
        expiresAt: expiresAt ?? null,
        verifiedAt: null,
      }),
    );
  }

  listForPlayer(playerId: string, user: User) {
    if (user.role === UserRole.PARENT) {
      return this.playerGuardians.findOne({
        where: { player: { id: playerId }, guardian: { user: { id: user.id } } },
      }).then((allowed) => {
        if (!allowed) throw new ForbiddenException('You cannot access documents');
        return this.documents.find({
          where: { player: { id: playerId } },
          order: { createdAt: 'DESC' },
        });
      });
    }

    return this.documents.find({
      where: { player: { id: playerId } },
      order: { createdAt: 'DESC' },
    });
  }

  async pathForDocument(id: string, user: User) {
    const document = await this.documents.findOne({
      where: { id },
      relations: { player: true },
    });
    if (!document) throw new NotFoundException('Document not found');

    if (user.role === UserRole.PARENT) {
      const allowed = await this.playerGuardians.findOne({
        where: { player: { id: document.player.id }, guardian: { user: { id: user.id } } },
      });
      if (!allowed) throw new ForbiddenException('You cannot access this document');
    }

    return join(process.cwd(), 'storage', document.storageKey);
  }
}
