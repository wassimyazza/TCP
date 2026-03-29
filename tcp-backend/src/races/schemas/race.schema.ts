import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { RaceStatus } from '../../enums/race-status.enum';

export type RaceDocument = Race & Document;

@Schema({ timestamps: true })
export class Race {
  @Prop({ type: Types.ObjectId, ref: 'Group', default: null })
  group: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: RaceStatus.WAITING, enum: Object.values(RaceStatus) })
  status: RaceStatus;

  @Prop({ default: null })
  startedAt: Date;

  @Prop({ default: null })
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
    finishedAt: Date;
  }[];
}

export const RaceSchema = SchemaFactory.createForClass(Race);
