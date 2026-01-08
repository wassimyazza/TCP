import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TextsService } from './texts.service';
import { CreateTextDto } from './dto/create-text.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('texts')
export class TextsController {
  constructor(private readonly textsService: TextsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateTextDto) {
    return this.textsService.create(dto);
  }

  @Get()
  findAll(
    @Query('language') language: string,
    @Query('difficulty') difficulty: string,
  ) {
    return this.textsService.findAll(language, difficulty);
  }

  @Get('random')
  getRandom(
    @Query('language') language: string,
    @Query('difficulty') difficulty: string,
  ) {
    return this.textsService.getRandom(language, difficulty);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.textsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.textsService.delete(id);
  }
}