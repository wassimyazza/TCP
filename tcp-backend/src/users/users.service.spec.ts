import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

const mockUser = {
  _id: 'user_id',
  username: 'wassim',
  email: 'wassim@test.com',
  role: 'user',
  stats: { totalRaces: 0, bestWpm: 0, averageWpm: 0, averageAccuracy: 0 },
  save: jest.fn(),
};

const mockUserModel = {
  findById: jest.fn(),
  findOne: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  find: jest.fn(),
};

describe('UsersService', () => {
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await usersService.findById('user_id');
      expect(result.username).toBe('wassim');
    });

    it('should throw if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(usersService.findById('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      const result = await usersService.findByEmail('wassim@test.com');
      expect(result.email).toBe('wassim@test.com');
    });

    it('should return null if not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const result = await usersService.findByEmail('no@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await usersService.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUserModel.findByIdAndDelete.mockResolvedValue(mockUser);
      await expect(usersService.delete('user_id')).resolves.not.toThrow();
    });
  });
});
