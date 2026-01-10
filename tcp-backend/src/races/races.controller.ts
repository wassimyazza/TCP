import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RacesService } from './races.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateQuickRaceDto } from './dto/create-quick-race.dto';

@Controller('races')
export class RacesController {
  constructor(private readonly racesService: RacesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('quick')
  createQuickRace(@Body() body: CreateQuickRaceDto) {
    return this.racesService.createQuickRace(body.text);
  }

  @UseGuards(JwtAuthGuard)
  @Post('group/:groupId')
  createForGroup(@Param('groupId') groupId: string) {
    return this.racesService.createRaceForGroup(groupId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getHistory(@Request() req) {
    return this.racesService.getUserHistory(req.user.id);
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: string) {
    return this.racesService.findByGroup(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.racesService.findOne(id);
  }
}