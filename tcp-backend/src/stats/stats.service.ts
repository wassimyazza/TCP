import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Race, RaceDocument } from '../races/schemas/race.schema';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
  ) {}

  async getLeaderboard() {
    return this.userModel
      .find({ 'stats.totalRaces': { $gt: 0 }, role: Role.USER })
      .select('username avatar stats')
      .sort({ 'stats.bestWpm': -1 })
      .limit(20);
  }

  async getUserStats(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('username avatar stats');
    if (!user) return null;

    const races = await this.raceModel
      .find({ 'players.user': userId, status: 'finished' })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentRaces = races.map((race) => {
      const raceObj = race.toObject() as any;
      const player = race.players.find((p) => p.user.toString() === userId);
      return {
        raceId: race._id,
        wpm: player?.wpm || 0,
        accuracy: player?.accuracy || 0,
        rank: player?.rank || 0,
        finishedAt: player?.finishedAt,
        createdAt: raceObj.createdAt,
      };
    });

    return { user, recentRaces };
  }

  async getGlobalStats() {
    const totalUsers = await this.userModel.countDocuments({ role: Role.USER });
    const totalRaces = await this.raceModel.countDocuments({
      status: 'finished',
    });

    const topUser = await this.userModel
      .findOne({ 'stats.totalRaces': { $gt: 0 }, role: Role.USER })
      .select('username stats')
      .sort({ 'stats.bestWpm': -1 });

    return { totalUsers, totalRaces, topUser };
  }
}
