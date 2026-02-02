import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TextDocument = Text & Document;

@Schema({ timestamps: true })
export class Text {
  @Prop({ required: true })
  content: string;

  @Prop({ default: 'en', enum: ['en', 'fr', 'ar'] })
  language: string;

  @Prop({ default: 'medium', enum: ['easy', 'medium', 'hard'] })
  difficulty: string;
}

export const TextSchema = SchemaFactory.createForClass(Text);
