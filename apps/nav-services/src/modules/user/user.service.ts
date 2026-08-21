import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { UserVO } from '@jg/api-types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(username: string, password: string): Promise<UserVO> {
    const exists = await this.userRepository.findOne({ where: { username } });
    if (exists) {
      throw new ConflictException('用户名已存在');
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepository.save(
      this.userRepository.create({ username, password: hashed })
    );
    return { id: user.id, username: user.username };
  }

  async validate(username: string, password: string): Promise<UserVO> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return { id: user.id, username: user.username };
  }

  async findById(id: number): Promise<UserVO | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ? { id: user.id, username: user.username } : null;
  }

  async signToken(user: UserVO): Promise<string> {
    return this.jwtService.signAsync({ id: user.id, username: user.username });
  }
}
