import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Championship', required: true })
  championship: Types.ObjectId;

  @Prop({ required: true })
  scheduledAt: Date;

  @Prop({ required: true })
  text: string;

  @Prop({ default: 10 })
  maxPlayers: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  players: Types.ObjectId[];

  @Prop({ default: 'waiting', enum: ['waiting', 'in_progress', 'finished'] })
  status: string;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        wpm: Number,
        accuracy: Number,
        rank: Number,
        finishedAt: Date,
      },
    ],
    default: [],
  })
  results: {
    user: Types.ObjectId;
    wpm: number;
    accuracy: number;
    rank: number;
    finishedAt: Date;
  }[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);
