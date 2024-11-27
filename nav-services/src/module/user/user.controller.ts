import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/globals/response.dto';
import { User } from './entities/user.entity';
import { Response } from 'express';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建用户成功' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<User>> {
    try {
      const user = await this.userService.create(createUserDto);
      return new ResponseDto(0, '注册成功', user);
    } catch (error) {
      return new ResponseDto(-1, error.message, error);
    }
  }

  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '成功获取所有用户' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findAll(): Promise<ResponseDto<User[]>> {
    try {
      const users = await this.userService.findAll();
      return new ResponseDto(0, '成功获取所有用户', users);
    } catch (error) {
      return new ResponseDto(-1, error.message, error);
    }
  }

  @Get(':username')
  @ApiOperation({ summary: '查找用户' })
  @ApiResponse({ status: 200, description: '成功获取用户' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findOne(
    @Param('username') username: string,
  ): Promise<ResponseDto<User>> {
    try {
      const user = await this.userService.findOne(username);
      if (!user) {
        return new ResponseDto(-1, '用户未找到', null);
      }
      return new ResponseDto(0, '成功获取用户', user);
    } catch (error) {
      return new ResponseDto(-1, error.message, error);
    }
  }

  @Patch(':username')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '成功更新用户' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async update(
    @Param('username') username: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<User>> {
    try {
      const updatedUser = await this.userService.update(
        username,
        updateUserDto,
      );
      if (!updatedUser) {
        return new ResponseDto(-1, '用户未找到', null);
      }
      return new ResponseDto(0, '成功更新用户', updatedUser);
    } catch (error) {
      return new ResponseDto(-1, error.message, error);
    }
  }

  @Delete(':username')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '成功删除用户' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async remove(
    @Param('username') username: string,
  ): Promise<ResponseDto<User>> {
    try {
      const result = await this.userService.remove(username);
      if (!result) {
        return new ResponseDto(-1, '用户未找到', null);
      }
      return new ResponseDto(0, '成功删除用户', result);
    } catch (error) {
      return new ResponseDto(-1, error.message, error);
    }
  }

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  async login(@Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    try {
      const user = await this.userService.validateUser(
        updateUserDto.username,
        updateUserDto.password,
      );

      const jwt = await this.userService.generateJwt(user);

      // 设置cookie
      res.cookie(
        'userInfo',
        JSON.stringify({
          id: user.id,
          username: user.username,
        }),
        { maxAge: 7 * 24 * 60 * 60 * 1000 },
      );

      return res.status(HttpStatus.OK).json(
        new ResponseDto(0, '登录成功', {
          token: jwt,
        }),
      );
    } catch (error) {
      return res.json(new ResponseDto(-1, error.message, error));
    }
  }
}
