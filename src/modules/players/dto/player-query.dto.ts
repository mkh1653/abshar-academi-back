import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PlayerStatus } from '../enums/player-status.enum';

export class PlayerQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() levelId?: string;
  @IsOptional() @IsString() coachId?: string;
  @IsOptional() @IsEnum(PlayerStatus) status?: PlayerStatus;
  @IsOptional() @IsInt() @Min(1) page = 1;
  @IsOptional() @IsInt() @Min(1) @Max(100) limit = 20;
}
