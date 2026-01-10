import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(dto: CreateGroupDto): Promise<GroupDocument> {
    const group = new this.groupModel(dto);
    return group.save();
  }

  async findAll(): Promise<GroupDocument[]> {
    return this.groupModel
      .find()
      .populate('championship', 'name')
      .populate('players', 'username avatar')
      .sort({ scheduledAt: 1 });
  }

  async findByChampionship(championshipId: string): Promise<GroupDocument[]> {
    return this.groupModel
      .find({ championship: championshipId })
      .populate('players', 'username avatar')
      .sort({ scheduledAt: 1 });
  }

  async findOne(id: string): Promise<GroupDocument> {
    const group = await this.groupModel
      .findById(id)
      .populate('championship', 'name')
      .populate('players', 'username avatar')
      .populate('results.user', 'username avatar');
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async update(id: string, dto: UpdateGroupDto): Promise<GroupDocument> {
    const group = await this.groupModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async delete(id: string): Promise<void> {
    await this.groupModel.findByIdAndDelete(id);
  }

  async joinGroup(groupId: string, userId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    if (group.status !== 'waiting') {
      throw new BadRequestException(
        'This group is no longer accepting players',
      );
    }

    const alreadyJoined = group.players.some((p) => p.toString() === userId);
    if (alreadyJoined)
      throw new BadRequestException('You already joined this group');

    if (group.players.length >= group.maxPlayers) {
      throw new BadRequestException('Group is full');
    }

    group.players.push(userId as any);
    return group.save();
  }

  async leaveGroup(groupId: string, userId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    if (group.status !== 'waiting') {
      throw new BadRequestException('You cannot leave after the race started');
    }

    group.players = group.players.filter((p) => p.toString() !== userId) as any;
    return group.save();
  }
}