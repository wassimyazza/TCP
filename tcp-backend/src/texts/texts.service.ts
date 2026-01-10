import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Text, TextDocument } from './schemas/text.schema';
import { CreateTextDto } from './dto/create-text.dto';

@Injectable()
export class TextsService {
  constructor(@InjectModel(Text.name) private textModel: Model<TextDocument>) {}

  async create(dto: CreateTextDto): Promise<TextDocument> {
    const text = new this.textModel(dto);
    return text.save();
  }

  async findAll(
    language?: string,
    difficulty?: string,
  ): Promise<TextDocument[]> {
    const filter: any = {};
    if (language) filter.language = language;
    if (difficulty) filter.difficulty = difficulty;
    return this.textModel.find(filter);
  }

  async findOne(id: string): Promise<TextDocument | null> {
    const text = await this.textModel.findById(id);
    if (!text) throw new NotFoundException('Text not found');
    return text;
  }

  async getRandom(
    language = 'en',
    difficulty = 'medium',
  ): Promise<TextDocument | null> {
    const count = await this.textModel.countDocuments({ language, difficulty });
    if (count === 0)
      throw new NotFoundException(
        'No texts found for this language and difficulty',
      );
    const random = Math.floor(Math.random() * count);
    return this.textModel.findOne({ language, difficulty }).skip(random);
  }

  async delete(id: string): Promise<void> {
    await this.textModel.findByIdAndDelete(id);
  }
}