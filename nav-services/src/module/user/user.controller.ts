import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResponseDto } from 'src/globals/response.dto';
import { User } from './entities/user.entity';
import { DeleteResult } from 'typeorm';

@ApiTags('用户管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 创建用户
  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建用户成功' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseDto<CreateUserDto>> {
    const user = await this.userService.create(createUserDto);
    return new ResponseDto(0, '创建用户成功', user);
  }

  // 获取所有用户
  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  @ApiResponse({ status: 200, description: '成功获取所有用户' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findAll(): Promise<ResponseDto<User[]>> {
    const users = await this.userService.findAll();
    return new ResponseDto(0, '成功获取所有用户', users);
  }

  // 根据ID查找用户
  @Get(':id')
  @ApiOperation({ summary: '查找用户' })
  @ApiResponse({ status: 200, description: '成功获取用户' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async findOne(@Param('id') id: string): Promise<ResponseDto<User>> {
    const user = await this.userService.findOne(+id);
    if (!user) {
      return new ResponseDto(-1, '用户未找到', null);
    }
    return new ResponseDto(0, '成功获取用户', user);
  }

  // 更新用户
  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  @ApiResponse({ status: 200, description: '成功更新用户' })
  @ApiResponse({ status: 400, description: '请求参数不正确' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseDto<User>> {
    const updatedUser = await this.userService.update(+id, updateUserDto);
    if (!updatedUser) {
      return new ResponseDto(-1, '用户未找到', null);
    }
    return new ResponseDto(0, '成功更新用户', updatedUser);
  }

  // 删除用户
  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '成功删除用户' })
  @ApiResponse({ status: 404, description: '用户未找到' })
  @ApiResponse({ status: 500, description: '服务器错误' })
  async remove(@Param('id') id: string): Promise<ResponseDto<DeleteResult>> {
    const result = await this.userService.remove(+id);
    if (!result) {
      return new ResponseDto(-1, '用户未找到', null);
    }
    return new ResponseDto(0, '成功删除用户', result);
  }
}
