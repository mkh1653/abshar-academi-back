import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Handedness } from '../enums/handedness.enum';
import { PlayerGender } from '../enums/player-gender.enum';
import { PlayerGoal } from '../enums/player-goal.enum';

export class RegisterPlayerDto {
  @IsString() @MinLength(2) firstNameFa!: string;
  @IsString() @MinLength(2) lastNameFa!: string;
  @IsString() @MinLength(2) fullNameLatin!: string;
  @IsDateString() birthDate!: string;
  @Matches(/^\d{10}$/) nationalId!: string;
  @IsEnum(PlayerGender) gender!: PlayerGender;
  @IsInt() @Min(80) @Max(250) heightCm!: number;
  @IsInt() @Min(20) @Max(250) weightKg!: number;
  @IsEnum(Handedness) dominantHand!: Handedness;

  @IsOptional() @IsString() playingPosition?: string;
  @IsOptional() @IsString() previousClub?: string;
  @IsOptional() @IsString() medicalConditions?: string;
  @IsOptional() @IsString() allergies?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) playerMobile?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) eitaaMobile?: string;
  @Matches(/^\+?[0-9]{10,15}$/) emergencyContact!: string;
  @IsString() @MinLength(5) address!: string;
  @IsOptional() @IsString() postalCode?: string;

  @IsOptional() @IsInt() @Min(100) @Max(350) heightWithReachCm?: number;
  @IsOptional() @IsInt() @Min(1) @Max(150) verticalJumpCm?: number;
  @IsOptional() @IsInt() @Min(50) @Max(300) wingspanCm?: number;
  @IsOptional() @IsString() volleyballExperience?: string;
  @IsOptional() @IsString() currentTeamOrSchool?: string;
  @IsEnum(PlayerGoal) goal!: PlayerGoal;

  @IsDateString() startTrainingMonth!: string;
  @IsDateString() insuranceExpiryDate!: string;
  @IsOptional() @IsString() clothingSize?: string;
  @IsOptional() @IsString() shoeSize?: string;

  @IsString() fatherFirstName!: string;
  @IsString() fatherLastName!: string;
  @IsOptional() @IsString() fatherOccupation?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) fatherMobile?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) fatherEitaaMobile?: string;

  @IsString() motherFirstName!: string;
  @IsString() motherLastName!: string;
  @IsOptional() @IsString() motherOccupation?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) motherMobile?: string;
  @IsOptional() @Matches(/^\+?[0-9]{10,15}$/) motherEitaaMobile?: string;

  @IsOptional() @IsEmail()
  @ValidateIf((dto: RegisterPlayerDto) => Boolean(dto.parentEmail))
  parentEmail?: string;

  @IsOptional() @IsString() @MinLength(8) parentPassword?: string;

  @IsBoolean() parentalConsent!: boolean;
  @IsBoolean() mediaConsent!: boolean;
  @IsBoolean() academyTermsAccepted!: boolean;
}
