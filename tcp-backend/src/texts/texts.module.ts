import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TextsService } from './texts.service';
import { TextsController } from './texts.controller';
import { Text, TextSchema } from './schemas/text.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Text.name, schema: TextSchema }]),
  ],
  controllers: [TextsController],
  providers: [TextsService],
  exports: [TextsService],
})
export class TextsModule {}