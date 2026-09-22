import { IsBoolean, IsDateString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdatePlayerByParentDto {
  @IsOptional() @IsString() @MaxLength(100) playerMobile?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) eitaaMobile?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) emergencyContact?: string;
  @IsOptional() @IsString() @MaxLength(500) address?: string;
  @IsOptional() @IsString() @MaxLength(20) postalCode?: string;
  @IsOptional() @IsString() clothingSize?: string;
  @IsOptional() @IsString() shoeSize?: string;
  @IsOptional() @IsBoolean() mediaConsent?: boolean;
  @IsOptional() @IsBoolean() parentalConsent?: boolean;
  @IsOptional() @IsBoolean() academyTermsAccepted?: boolean;
  @IsOptional() @IsDateString() insuranceExpiryDate?: string;
}
