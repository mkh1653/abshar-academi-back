import { IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateHallDto {
  @IsString() name!: string;
  @IsString() address!: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
  @IsOptional() @IsNumber() @Min(-90) @Max(90) latitude?: number;
  @IsOptional() @IsNumber() @Min(-180) @Max(180) longitude?: number;
}
