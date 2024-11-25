import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.findOne(createUserDto.username);
    if (user !== null) {
      throw new ConflictException('用户名已存在');
    }
    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );
    createUserDto.password = hashedPassword;

    // 保存用户
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async update(username: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(username);
    if (!user) {
      throw new ConflictException('用户名不存在');
    }
    // 更新用户数据
    Object.assign(user, updateUserDto);
    if (updateUserDto.password) {
      // 加密新密码
      const saltRounds = 10;
      user.password = await bcrypt.hash(updateUserDto.password, saltRounds);
    }

    return this.userRepository.save(user);
  }

  async remove(username: string): Promise<User> {
    const user = await this.findOne(username);
    if (!user) {
      throw new ConflictException('用户名不存在');
    }
    return await this.userRepository.remove(user);
  }

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('用户名或密码错误');
  }
}
