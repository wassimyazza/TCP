import { IsString, MinLength } from 'class-validator';

export class CreateQuickRaceDto {
  @IsString()
  @MinLength(20)
  text: string;
}
