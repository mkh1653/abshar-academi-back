import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMatchDto {
  @IsString() title!: string;
  @IsString() opponent!: string;
  @IsDateString() matchDate!: string;
  @IsString() venue!: string;
  @IsOptional() @IsString() result?: string;
  @IsOptional() @IsString() score?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
