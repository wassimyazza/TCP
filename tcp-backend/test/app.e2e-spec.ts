import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

const supertestLib = require('supertest');

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api');
    await app.init();

    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await dbConnection
      .collection('users')
      .deleteMany({ email: 'e2e@test.com' });
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'e2euser',
          email: 'e2e@test.com',
          password: '123456',
        });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('e2e@test.com');
    });

    it('should fail with invalid data', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/register')
        .send({ username: 'x', email: 'not_an_email', password: '123' });

      expect(res.status).toBe(400);
    });

    it('should fail if email already used', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: 'e2euser2',
          email: 'e2e@test.com',
          password: '123456',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'e2e@test.com', password: '123456' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'e2e@test.com', password: 'wrongpass' });

      expect(res.status).toBe(401);
    });

    it('should fail with unknown email', async () => {
      const res = await supertestLib(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nobody@test.com', password: '123456' });

      expect(res.status).toBe(401);
    });
  });
});
