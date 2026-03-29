import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../enums/role.enum';
import { Provider } from '../../enums/provider.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ default: '' })
  password: string;

  @Prop({ default: Role.USER, enum: Object.values(Role) })
  role: Role;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: Provider.LOCAL, enum: Object.values(Provider) })
  provider: Provider;

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