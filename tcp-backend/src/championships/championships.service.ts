import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Championship,
  ChampionshipDocument,
} from './schemas/championship.schema';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';

@Injectable()
export class ChampionshipsService {
  constructor(
    @InjectModel(Championship.name)
    private championshipModel: Model<ChampionshipDocument>,
  ) {}

  async create(dto: CreateChampionshipDto): Promise<ChampionshipDocument> {
    const championship = new this.championshipModel(dto);
    return championship.save();
  }

  async findAll(): Promise<ChampionshipDocument[]> {
    return this.championshipModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<ChampionshipDocument> {
    const championship = await this.championshipModel.findById(id);
    if (!championship) throw new NotFoundException('Championship not found');
    return championship;
  }

  async update(
    id: string,
    dto: UpdateChampionshipDto,
  ): Promise<ChampionshipDocument> {
    const championship = await this.championshipModel.findByIdAndUpdate(
      id,
      dto,
      { new: true },
    );
    if (!championship) throw new NotFoundException('Championship not found');
    return championship;
  }

  async delete(id: string): Promise<void> {
    await this.championshipModel.findByIdAndDelete(id);
  }
}
