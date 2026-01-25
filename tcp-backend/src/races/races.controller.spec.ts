import { Test, TestingModule } from '@nestjs/testing';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

const mockRacesService = {
  createQuickRace: jest.fn(),
  createRaceForGroup: jest.fn(),
  getUserHistory: jest.fn(),
  findByGroup: jest.fn(),
  findOne: jest.fn(),
};

describe('RacesController', () => {
  let controller: RacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RacesController],
      providers: [{ provide: RacesService, useValue: mockRacesService }],
    }).compile();

    controller = module.get<RacesController>(RacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
