import {
  IsString,
  IsDateString,
  IsNumber,
  IsMongoId,
  Min,
  MinLength,
} from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsMongoId()
  championship: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @MinLength(20)
  text: string;

  @IsNumber()
  @Min(2)
  maxPlayers: number;
}