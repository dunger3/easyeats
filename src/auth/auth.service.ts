import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../entities';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  private issue(user: User) {
    const access_token = this.jwt.sign({
      sub: user.user_id, email: user.email, role: user.role,
    });
    return {
      access_token,
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash))) {
      throw new UnauthorizedException('Incorrect email or password.');
    }
    return this.issue(user);
  }

  async register(dto: RegisterDto) {
    if (await this.users.findByEmail(dto.email))
      throw new ConflictException('That email is already registered.');

    const user = await this.users.create({
      email: dto.email,
      name: dto.name,
      password_hash: await bcrypt.hash(dto.password, 12),
      role: 'customer',
    });
    return this.issue(user);
  }
}
