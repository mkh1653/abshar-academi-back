import { IsString } from 'class-validator';

export class ChangeLevelDto {
  @IsString()
  levelId!: string;
}
