import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('leaderboard')
  getLeaderboard() {
    return this.statsService.getLeaderboard();
  }

  @Get('global')
  getGlobalStats() {
    return this.statsService.getGlobalStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyStats(@Request() req) {
    return this.statsService.getUserStats(req.user.id);
  }

  @Get('user/:userId')
  getUserStats(@Param('userId') userId: string) {
    return this.statsService.getUserStats(userId);
  }
}