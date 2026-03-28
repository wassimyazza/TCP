import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly usersService: UsersService) {}

  async onApplicationBootstrap() {
    const adminExists = await this.usersService.findByUsername('admin');
    if (!adminExists) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.usersService.create({
        username: 'admin',
        email: 'admin@tcp.com',
        password: hashed,
        role: 'admin',
      });
      console.log('Admin created: admin@tcp.com / admin123');
    }
  }
}
