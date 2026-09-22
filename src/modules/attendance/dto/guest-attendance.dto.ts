import { IsOptional, IsString, Matches } from 'class-validator';

export class GuestAttendanceDto {
  @IsString() guestName!: string;
  @Matches(/^\+?[0-9]{10,15}$/) guestMobile!: string;
  @IsOptional() @IsString() note?: string;
}
