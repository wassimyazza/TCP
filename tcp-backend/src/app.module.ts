import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChampionshipsModule } from './championships/championships.module';
import { GroupsModule } from './groups/groups.module';
import { RacesModule } from './races/races.module';
import { StatsModule } from './stats/stats.module';
import { TextsModule } from './texts/texts.module';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ChampionshipsModule,
    GroupsModule,
    RacesModule,
    StatsModule,
    TextsModule,
  ],
  providers: [SeedService],
})
export class AppModule {}

