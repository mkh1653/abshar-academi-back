import { IsDateString, IsOptional, IsString } from 'class-validator';
import { SessionStatus } from '../enums/session-status.enum';

export class CreateTrainingSessionDto {
  @IsString() trainingGroupId!: string;
  @IsDateString() sessionDate!: string;
  @IsDateString() startsAt!: string;
  @IsDateString() endsAt!: string;
  @IsOptional() status?: SessionStatus;
}
