import { PartialType } from '@nestjs/mapped-types';
import { RegisterPlayerDto } from './register-player.dto';

export class UpdatePlayerDto extends PartialType(RegisterPlayerDto) {}
