import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsOptional() @IsString() summary?: string;
  @IsString() content!: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
