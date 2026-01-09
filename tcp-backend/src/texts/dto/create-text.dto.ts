import { IsString, IsEnum, MinLength } from 'class-validator';

export class CreateTextDto {
  @IsString()
  @MinLength(20)
  content: string;

  @IsEnum(['en', 'fr', 'ar'])
  language: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;
}