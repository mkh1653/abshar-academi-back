import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateCoachDto {
  @IsString() firstName!: string;
  @IsString() lastName!: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) mobile?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() bio?: string;
}
