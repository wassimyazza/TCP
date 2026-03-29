import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Race, RaceDocument } from './schemas/race.schema';
import { Group, GroupDocument } from '../groups/schemas/group.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RaceStatus } from 'src/enums/race-status.enum';

@Injectable()
export class RacesService {
  constructor(
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createRaceForGroup(groupId: string): Promise<RaceDocument> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const existing = await this.raceModel.findOne({
      group: groupId,
      status: { $ne: RaceStatus.FINISHED },
    });
    if (existing) return existing;

    const race = new this.raceModel({
      group: groupId,
      text: group.text,
      players: [],
    });

    return race.save();
  }

  async createQuickRace(text: string): Promise<RaceDocument> {
    const race = new this.raceModel({ text, players: [] });
    return race.save();
  }

  async findOne(id: string): Promise<RaceDocument> {
    const race = await this.raceModel.findById(id);
    if (!race) throw new NotFoundException('Race not found');
    return race;
  }

  async findByGroup(groupId: string): Promise<RaceDocument | null> {
    return this.raceModel.findOne({ group: groupId }).sort({ createdAt: -1 });
  }

  async getUserHistory(userId: string): Promise<RaceDocument[]> {
    return this.raceModel
      .find({ 'players.user': userId, status: RaceStatus.FINISHED })
      .sort({ createdAt: -1 })
      .limit(20);
  }

  async addPlayerToRace(
    raceId: string,
    userId: string,
    username: string,
  ): Promise<RaceDocument> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');

    const alreadyIn = race.players.some((p) => p.user.toString() === userId);
    if (!alreadyIn) {
      race.players.push({
        user: new Types.ObjectId(userId),
        username,
        progress: 0,
        wpm: 0,
        accuracy: 0,
        rank: 0,
        finishedAt: null as any,
      });
      await race.save();
    }

    return race;
  }

  async updatePlayerProgress(
    raceId: string,
    userId: string,
    progress: number,
    wpm: number,
    accuracy: number,
  ): Promise<RaceDocument> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');

    const player = race.players.find((p) => p.user.toString() === userId);
    if (player) {
      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;

      if (progress >= 100 && !player.finishedAt) {
        player.finishedAt = new Date();
      }
    }

    await race.save();
    return race;
  }

  async startRace(raceId: string): Promise<RaceDocument> {
    const race = await this.raceModel.findByIdAndUpdate(
      raceId,
      { status: 'in_progress', startedAt: new Date() },
      { new: true },
    );
    if (!race) throw new NotFoundException('Race not found');
    return race;
  }

  async setCountdown(raceId: string): Promise<RaceDocument> {
    const race = await this.raceModel.findByIdAndUpdate(
      raceId,
      { status: 'countdown' },
      { new: true },
    );
    if (!race) throw new NotFoundException('Race not found');
    return race;
  }

  async finishRace(raceId: string): Promise<RaceDocument> {
    const race = await this.raceModel.findById(raceId);
    if (!race) throw new NotFoundException('Race not found');
    if (race.status === RaceStatus.FINISHED) return race;

    for (const player of race.players) {
      if (!player.finishedAt) {
        player.finishedAt = new Date();
      }
    }

    race.players.sort((a, b) => b.wpm - a.wpm);
    race.players.forEach((player, index) => {
      player.rank = index + 1;
    });

    race.status = RaceStatus.FINISHED;
    race.finishedAt = new Date();
    await race.save();
    await this.saveResultsToGroup(race);

    return race;
  }

  private async saveResultsToGroup(race: RaceDocument): Promise<void> {
    if (!race.group) return;

    const results = race.players.map((p) => ({
      user: p.user,
      wpm: p.wpm,
      accuracy: p.accuracy,
      rank: p.rank,
      finishedAt: p.finishedAt,
    }));

    await this.groupModel.findByIdAndUpdate(race.group, {
      status: RaceStatus.FINISHED,
      results,
    });

    for (const player of race.players) {
      const user = await this.userModel.findById(player.user);
      if (!user) continue;

      const totalRaces = user.stats.totalRaces + 1;
      const bestWpm = Math.max(user.stats.bestWpm, player.wpm);
      const averageWpm = Math.round(
        (user.stats.averageWpm * user.stats.totalRaces + player.wpm) /
          totalRaces,
      );
      const averageAccuracy = Math.round(
        (user.stats.averageAccuracy * user.stats.totalRaces + player.accuracy) /
          totalRaces,
      );

      await this.userModel.findByIdAndUpdate(player.user, {
        stats: { totalRaces, bestWpm, averageWpm, averageAccuracy },
      });
    }
  }
}

