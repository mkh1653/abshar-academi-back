import { IsDateString, IsOptional, IsString } from 'class-validator';

export class EnrollPlayerDto {
  @IsString() playerId!: string;
  @IsDateString() startsOn!: string;
  @IsOptional() @IsDateString() endsOn?: string;
  @IsOptional() @IsString() note?: string;
}
