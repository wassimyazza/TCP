import { Test, TestingModule } from '@nestjs/testing';
import { ChampionshipsService } from './championships.service';
import { getModelToken } from '@nestjs/mongoose';
import { Championship } from './schemas/championship.schema';
import { NotFoundException } from '@nestjs/common';

const mockChampionship = {
  _id: 'champ_id',
  name: 'Spring Championship',
  description: 'Test',
  status: 'active',
};

const mockChampionshipModel = {
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

describe('ChampionshipsService', () => {
  let service: ChampionshipsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChampionshipsService,
        {
          provide: getModelToken(Championship.name),
          useValue: mockChampionshipModel,
        },
      ],
    }).compile();

    service = module.get<ChampionshipsService>(ChampionshipsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all championships', async () => {
      mockChampionshipModel.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([mockChampionship]),
      });

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Spring Championship');
    });
  });

  describe('findOne', () => {
    it('should return one championship', async () => {
      mockChampionshipModel.findById.mockResolvedValue(mockChampionship);
      const result = await service.findOne('champ_id');
      expect(result.name).toBe('Spring Championship');
    });

    it('should throw if not found', async () => {
      mockChampionshipModel.findById.mockResolvedValue(null);
      await expect(service.findOne('bad_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a championship', async () => {
      mockChampionshipModel.findByIdAndUpdate.mockResolvedValue({
        ...mockChampionship,
        status: 'finished',
      });

      const result = await service.update('champ_id', { status: 'finished' });
      expect(result.status).toBe('finished');
    });

    it('should throw if championship not found', async () => {
      mockChampionshipModel.findByIdAndUpdate.mockResolvedValue(null);
      await expect(
        service.update('bad_id', { status: 'finished' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
