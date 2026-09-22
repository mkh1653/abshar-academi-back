import { IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { ClassGender } from '../enums/class-gender.enum';
import { TrainingDay } from '../enums/training-day.enum';

export class CreateTrainingGroupDto {
  @IsString() name!: string;
  @IsOptional() @IsString() levelId?: string;
  @IsString() hallId!: string;
  @IsString() coachId!: string;
  @IsEnum(ClassGender) gender!: ClassGender;
  @IsEnum(TrainingDay) trainingDay!: TrainingDay;
  @Matches(/^([01]\\d|2[0-3]):[0-5]\\d$/) startTime!: string;
  @Matches(/^([01]d|2[0-3]):[0-5]d$/) endTime!: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}
