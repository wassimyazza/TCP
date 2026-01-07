import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.usersService.findByEmail(dto.email);
    if (emailExists) throw new BadRequestException('Email already in use');

    const usernameExists = await this.usersService.findByUsername(dto.username);
    if (usernameExists) throw new BadRequestException('Username already taken');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }

  private generateToken(user: any) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      role: user.role,
    });
  }
  async loginWithOAuth(profile: {
    email: string;
    username: string;
    provider: string;
    providerId: string;
  }) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      let username = profile.username;
      const existingUsername = await this.usersService.findByUsername(username);
      if (existingUsername) {
        username = `${username}${Math.floor(Math.random() * 9999)}`;
      }

      user = await this.usersService.create({
        email: profile.email,
        username,
        password: '',
        provider: profile.provider,
        providerId: profile.providerId,
      });
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}