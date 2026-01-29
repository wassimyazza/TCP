import { Test, TestingModule } from '@nestjs/testing';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

const mockGroupsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  findByChampionship: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  joinGroup: jest.fn(),
  leaveGroup: jest.fn(),
};

describe('GroupsController', () => {
  let controller: GroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupsController],
      providers: [{ provide: GroupsService, useValue: mockGroupsService }],
    }).compile();

    controller = module.get<GroupsController>(GroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
