import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: 'user', enum: ['user', 'admin'] })
  role: string;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: 'local', enum: ['local', 'google', 'facebook'] })
  provider: string;

  @Prop({ default: '' })
  providerId: string;

  @Prop({
    type: {
      totalRaces: { type: Number, default: 0 },
      bestWpm: { type: Number, default: 0 },
      averageWpm: { type: Number, default: 0 },
      averageAccuracy: { type: Number, default: 0 },
    },
    default: {},
  })
  stats: {
    totalRaces: number;
    bestWpm: number;
    averageWpm: number;
    averageAccuracy: number;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
