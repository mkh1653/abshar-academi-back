import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { Player } from '../../players/entities/player.entity';
import { User } from '../../users/entities/user.entity';
import { PlayerDocumentType } from '../enums/player-document-type.enum';

@Entity('player_documents')
@Index(['player', 'type'])
export class PlayerDocument extends BaseEntity {
  @ManyToOne(() => Player, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Player;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedByUser!: User | null;

  @Column({ type: 'enum', enum: PlayerDocumentType })
  type!: PlayerDocumentType;

  @Column({ name: 'storage_key', type: 'varchar', length: 500 })
  storageKey!: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize!: string;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt!: string | null;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt!: Date | null;
}
