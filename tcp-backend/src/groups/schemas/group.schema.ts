import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GroupStatus } from '../../enums/group-status.enum';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Championship', required: true })
  championship: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ default: 10 })
  maxPlayers: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  players: Types.ObjectId[];

  @Prop({ default: GroupStatus.WAITING, enum: Object.values(GroupStatus) })
  status: GroupStatus;

  @Prop({ type: Array, default: [] })
  results: {
    user: Types.ObjectId;
    wpm: number;
    accuracy: number;
    rank: number;
    finishedAt: Date;
  }[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
