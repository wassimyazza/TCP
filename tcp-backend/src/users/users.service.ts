import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username });
  }

  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');

    if (dto.newPassword) {
      if (!dto.oldPassword) {
        throw new BadRequestException(
          'Old password is required to set a new password',
        );
      }

      const isOldPasswordCorrect = await bcrypt.compare(
        dto.oldPassword,
        user.password,
      );
      if (!isOldPasswordCorrect) {
        throw new BadRequestException('Old password is incorrect');
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
    }

    if (dto.username) user.username = dto.username;
    if (dto.avatar) user.avatar = dto.avatar;

    await user.save();

    return this.userModel.findById(id).select('-password');
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password');
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }
}
