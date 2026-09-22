import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateProgressReportDto {
  @IsString() playerId!: string;
  @IsDateString() periodStart!: string;
  @IsDateString() periodEnd!: string;
  @IsOptional() @IsString() physicalNotes?: string;
  @IsOptional() @IsString() technicalNotes?: string;
  @IsOptional() @IsString() psychologicalNotes?: string;
  @IsOptional() @IsString() generalNotes?: string;
}
