import { Test, TestingModule } from '@nestjs/testing';
import { GroupsService } from './groups.service';
import { getModelToken } from '@nestjs/mongoose';
import { Group } from './schemas/group.schema';

const mockGroupModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('GroupsService', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: getModelToken(Group.name), useValue: mockGroupModel },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
