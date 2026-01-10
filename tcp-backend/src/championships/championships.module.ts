import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChampionshipsService } from './championships.service';
import { ChampionshipsController } from './championships.controller';
import {
  Championship,
  ChampionshipSchema,
} from './schemas/championship.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Championship.name, schema: ChampionshipSchema },
    ]),
  ],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  exports: [ChampionshipsService],
})
export class ChampionshipsModule {}