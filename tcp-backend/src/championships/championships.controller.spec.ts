import { Test, TestingModule } from '@nestjs/testing';
import { ChampionshipsController } from './championships.controller';
import { ChampionshipsService } from './championships.service';

const mockChampionshipsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('ChampionshipsController', () => {
  let controller: ChampionshipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChampionshipsController],
      providers: [
        { provide: ChampionshipsService, useValue: mockChampionshipsService },
      ],
    }).compile();

    controller = module.get<ChampionshipsController>(ChampionshipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
