import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChampionshipDocument = Championship & Document;

@Schema({ timestamps: true })
export class Championship {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: 'active', enum: ['active', 'finished'] })
  status: string;
}

export const ChampionshipSchema = SchemaFactory.createForClass(Championship);
