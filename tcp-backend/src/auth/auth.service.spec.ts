import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        _id: 'user_id',
        username: 'wassim',
        email: 'wassim@test.com',
        role: 'user',
      });

      const result = await authService.register({
        username: 'wassim',
        email: 'wassim@test.com',
        password: '123456',
      });

      expect(result.token).toBe('mock_token');
      expect(result.user.email).toBe('wassim@test.com');
    });

    it('should throw if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        email: 'wassim@test.com',
      });

      await expect(
        authService.register({
          username: 'wassim',
          email: 'wassim@test.com',
          password: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if username already taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue({ username: 'wassim' });

      await expect(
        authService.register({
          username: 'wassim',
          email: 'wassim@test.com',
          password: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login and return token', async () => {
      const hashed = await bcrypt.hash('123456', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        _id: 'user_id',
        username: 'wassim',
        email: 'wassim@test.com',
        password: hashed,
        role: 'user',
      });

      const result = await authService.login({
        email: 'wassim@test.com',
        password: '123456',
      });

      expect(result.token).toBe('mock_token');
    });

    it('should throw if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'wrong@test.com', password: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is wrong', async () => {
      const hashed = await bcrypt.hash('correct_password', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        _id: 'user_id',
        email: 'wassim@test.com',
        password: hashed,
        role: 'user',
      });

      await expect(
        authService.login({
          email: 'wassim@test.com',
          password: 'wrong_password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});