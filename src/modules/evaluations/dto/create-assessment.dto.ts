import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAssessmentDto {
  @IsString() playerId!: string;
  @IsDateString() assessedAt!: string;
  @IsOptional() @IsString() recommendedLevelId?: string;
  @IsOptional() @IsInt() @Min(80) @Max(250) heightCm?: number;
  @IsOptional() @IsInt() @Min(20) @Max(250) weightKg?: number;
  @IsOptional() @IsInt() @Min(100) @Max(350) reachCm?: number;
  @IsOptional() @IsInt() @Min(1) @Max(150) verticalJumpCm?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) speedScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) passingScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) receptionScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) settingScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) servingScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) attackScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) blockScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) defenseScore?: number;
  @IsOptional() @IsInt() @Min(0) @Max(100) strengthScore?: number;
  @IsOptional() @IsString() notes?: string;
}
