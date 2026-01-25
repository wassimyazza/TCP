import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceDocument = Race & Document;

@Schema({ timestamps: true })
export class Race {
  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  group: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({
    default: 'waiting',
    enum: ['waiting', 'countdown', 'in_progress', 'finished'],
  })
  status: string;

  @Prop({ type: Date, default: null })
  startedAt: Date;

  @Prop({ type: Date, default: null })
  finishedAt: Date;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        username: String,
        progress: { type: Number, default: 0 },
        wpm: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        rank: { type: Number, default: 0 },
        finishedAt: { type: Date, default: null },
      },
    ],
    default: [],
  })
  players: {
    user: Types.ObjectId;
    username: string;
    progress: number;
    wpm: number;
    accuracy: number;
    rank: number;
    finishedAt: Date | null;
  }[];
}

export const RaceSchema = SchemaFactory.createForClass(Race);
