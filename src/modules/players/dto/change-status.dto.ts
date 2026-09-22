import { IsEnum } from 'class-validator';
import { PlayerStatus } from '../enums/player-status.enum';

export class ChangeStatusDto {
  @IsEnum(PlayerStatus)
  status!: PlayerStatus;
}
