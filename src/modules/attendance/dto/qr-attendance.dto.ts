import { IsString } from 'class-validator';

export class QrAttendanceDto {
  @IsString()
  token!: string;

  @IsString()
  playerId!: string;
}
