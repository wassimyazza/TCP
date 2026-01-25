import { Test, TestingModule } from '@nestjs/testing';
import { RacesService } from './races.service';
import { getModelToken } from '@nestjs/mongoose';
import { Race } from './schemas/race.schema';
import { Group } from '../groups/schemas/group.schema';
import { User } from '../users/schemas/user.schema';

const mockRaceModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockGroupModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

describe('RacesService', () => {
  let service: RacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RacesService,
        { provide: getModelToken(Race.name), useValue: mockRaceModel },
        { provide: getModelToken(Group.name), useValue: mockGroupModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<RacesService>(RacesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});