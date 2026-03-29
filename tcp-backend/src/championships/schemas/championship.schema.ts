import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ChampionshipStatus } from '../../enums/championship-status.enum';

export type ChampionshipDocument = Championship & Document;

@Schema({ timestamps: true })
export class Championship {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    default: ChampionshipStatus.ACTIVE,
    enum: Object.values(ChampionshipStatus),
  })
  status: ChampionshipStatus;
}

export const ChampionshipSchema = SchemaFactory.createForClass(Championship);
